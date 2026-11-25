"""Bot video animasi serial. Dashboard (index.html) menulis job ke data/jobs.json, bot mengerjakannya di GitHub Actions.

Job:
  type=gambar  : narasi bertag -> gambar tiap adegan (Remotion) -> dikirim ke Telegram sebagai dokumen PNG
  type=video   : gambar yang diunggah + narasi + suara -> video MP4 (Remotion) -> dikirim ke Telegram
Tidak ada upload otomatis ke YouTube: hasil akhir hanya dikirim ke Telegram.
"""
import os, sys, json, re, time, shutil, asyncio, random, subprocess, datetime as dt, requests

TG = os.environ.get('TG_TOKEN', '')
CHAT = os.environ.get('TG_CHAT_ID', '')
API = f'https://api.telegram.org/bot{TG}'
FPS = 30
VOICES = {'wanita': 'id-ID-GadisNeural', 'pria': 'id-ID-ArdiNeural'}
RATES = {'pelan': '-10%', 'normal': '+0%', 'cepat': '+10%'}
LEAD, TAIL = 0.35, 0.45          # detik: jeda sebelum suara mulai & sesudah suara selesai
MAX_TG = 49 * 1024 * 1024        # batas unggah bot Telegram ~50 MB


# ---------------------------------------------------------------- data & git
def load(f, d):
    try: return json.load(open('data/' + f))
    except Exception: return d


def save(f, d):
    os.makedirs('data', exist_ok=True)
    json.dump(d, open('data/' + f, 'w'), ensure_ascii=False, indent=1)


def git(m):
    os.system('git config user.name bot; git config user.email bot@users.noreply.github.com; '
              f'git add data; git diff --cached --quiet || git commit -qm "{m}"')
    for _ in range(4):
        if os.system('git pull -q --rebase -X theirs --autostash && git push -q') == 0: break


def pull(): os.system('git pull -q --rebase -X theirs --autostash')


def patch_job(jid, **kw):
    """Ambil data terbaru (dashboard mungkin menambah job saat render berjalan), ubah satu job, simpan."""
    pull()
    jobs = load('jobs.json', [])
    for j in jobs:
        if j['id'] == jid: j.update(kw)
    save('jobs.json', jobs[-40:])
    git('bot: status job ' + jid)


# ---------------------------------------------------------------- telegram
def http(method, url, tries=4, **kw):
    kw.setdefault('timeout', 60)
    for i in range(tries):
        try: return requests.request(method, url, **kw)
        except (requests.ConnectionError, requests.Timeout):
            if i == tries - 1: raise
            time.sleep(3 * 2 ** i)


def say(text):
    if not CHAT: return
    try: requests.post(API + '/sendMessage', data={'chat_id': CHAT, 'text': text[:3500]}, timeout=30)
    except Exception: pass


def tgfile(fid, path):
    p = http('GET', API + '/getFile', params={'file_id': fid}).json()
    if not p.get('ok'): raise Exception('Telegram: ' + str(p.get('description')))
    r = http('GET', f'https://api.telegram.org/file/bot{TG}/' + p['result']['file_path'], timeout=180)
    if r.status_code != 200: raise Exception('Telegram: unduh file gagal (%s)' % r.status_code)
    open(path, 'wb').write(r.content)


def send_docs(paths, captions):
    """Kirim PNG sebagai dokumen (ukuran asli, tidak dikompres), maksimal 10 per album."""
    for i in range(0, len(paths), 10):
        grp = paths[i:i + 10]
        media, files = [], {}
        for k, p in enumerate(grp):
            media.append({'type': 'document', 'media': f'attach://f{k}', 'caption': captions[i + k][:1000]})
            files[f'f{k}'] = open(p, 'rb')
        r = http('POST', API + '/sendMediaGroup', data={'chat_id': CHAT, 'media': json.dumps(media)}, files=files, timeout=300).json()
        for f in files.values(): f.close()
        if not r.get('ok'): raise Exception('Telegram: ' + str(r.get('description')))
        time.sleep(1.5)


def send_video(path, caption, w=1080, h=1920):
    with open(path, 'rb') as f:
        r = http('POST', API + '/sendVideo', data={'chat_id': CHAT, 'supports_streaming': 'true', 'width': w, 'height': h,
                 'caption': caption[:1000]}, files={'video': f}, timeout=600).json()
    if not r.get('ok'): raise Exception('Telegram: ' + str(r.get('description')))


# ---------------------------------------------------------------- Node (Remotion)
def node(*args, cwd='.'):
    r = subprocess.run(['node', *args], cwd=cwd, capture_output=True, text=True)
    if r.returncode != 0:
        raise Exception('Render gagal: ' + (r.stderr or r.stdout)[-600:])
    return r.stdout


def plan(narasi, work):
    f = f'{work}/narasi.txt'
    open(f, 'w', encoding='utf-8').write(narasi)
    return json.loads(node('render/plan.mjs', f))


# ---------------------------------------------------------------- suara
async def _tts(text, path, voice, rate):
    import edge_tts
    await edge_tts.Communicate(text, voice, rate=rate).save(path)


def duration(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True)
    return float(r.stdout.strip())


def speak(text, path, voice, rate):
    err = ''
    for i in range(3):
        try:
            asyncio.run(_tts(text, path, voice, rate))
            if os.path.getsize(path) > 500: return duration(path)
        except Exception as e:
            err = str(e)[:150]
        time.sleep(2 * (i + 1))
    raise Exception('Suara gagal dibuat: ' + err)


def tts_text(t):
    t = t.replace('…', '...').replace('—', ', ').replace('–', ', ')
    return re.sub(r'\s+', ' ', t).strip()


def chunks(text, maxc=70):
    """Pecah teks menjadi potongan subtitle (maks ~2 baris), per kalimat lalu per anak kalimat."""
    out = []
    for s in re.split(r'(?<=[.!?])\s+', text.strip()):
        if not s: continue
        if len(s) <= maxc: out.append(s); continue
        cur = ''
        for w in s.split():
            if len(cur) + len(w) + 1 > maxc and cur: out.append(cur); cur = w
            else: cur = (cur + ' ' + w).strip()
        if cur: out.append(cur)
    # gabungkan potongan yang terlalu pendek
    merged = []
    for c in out:
        if merged and len(c) < 14 and len(merged[-1]) + len(c) < maxc: merged[-1] += ' ' + c
        else: merged.append(c)
    return merged


def build_timeline(plan_, voices_dir, images, voice, rate):
    header, scenes = plan_['header'], plan_['scenes']
    t, out = 0, []
    for i, sc in enumerate(scenes):
        d, audio = 0.0, None
        if sc['text']:
            audio = f'v{i}.mp3'
            d = speak(tts_text(sc['text']), f'{voices_dir}/{audio}', voice, rate)
        dur = (d + LEAD + TAIL if d else 2.0) + sc.get('jeda', 0)
        dur = max(2.4 if d else 1.6, dur) + (0.9 if i == len(scenes) - 1 else 0)
        n = round(dur * FPS)
        subs = []
        if d:
            cs = chunks(sc['text'])
            total = sum(len(c) for c in cs) or 1
            a = t + round(LEAD * FPS)
            for c in cs:
                span = round(d * FPS * len(c) / total)
                subs.append({'text': c, 'start': a, 'end': a + max(span, 12)})
                a += span
        out.append({'index': i, 'image': images[i], 'start': t, 'dur': n, 'cam': sc['kamera'], 'scene': sc,
                    'audio': audio, 'audioOffset': round(LEAD * FPS), 'audioDur': round(d * FPS) if d else 0,
                    'subs': subs, 'hideSub': bool(sc.get('cta'))})
        t += n
    return {'fps': FPS, 'header': header, 'totalFrames': t, 'scenes': out}


# ---------------------------------------------------------------- job
def job_gambar(j, work):
    p = plan(j['narasi'], work)
    n = len(p['scenes'])
    if not n: raise Exception('Narasi kosong: tidak ada adegan')
    say(f'🎨 Merender {n} gambar adegan "{j.get("judul") or p["header"].get("judul", "")}"...' +
        (('\n⚠ ' + '\n⚠ '.join(p['warnings'][:8])) if p['warnings'] else ''))
    out = f'{work}/gambar'
    node('render/stills.mjs', f'{work}/narasi.txt', out)
    sc = json.load(open(f'{out}/scenes.json'))
    files = [f'{out}/{x}' for x in sc['files']]
    caps = [f"Adegan {s['index'] + 1}/{n}\n{s['text'] or '(tanpa teks)'}\n[{s['latar']}" + (f" · {s['tokoh']['pose']}/{s['tokoh']['ekspresi']}" if s['tokoh'] else ' · tanpa tokoh') + ']' for s in sc['scenes']]
    send_docs(files, caps)
    say(f'✅ {n} gambar terkirim. Unduh semuanya, lalu unggah di menu Buat Video bersama narasi yang sama.')
    return f'{n} gambar terkirim ke Telegram'


def job_video(j, work):
    p = plan(j['narasi'], work)
    scenes = p['scenes']
    imgs = j.get('images') or []   # opsional: kosong = semua adegan dirender langsung (animasi)
    if not scenes: raise Exception('Narasi kosong: tidak ada adegan')
    if imgs and len(scenes) != len(imgs):
        raise Exception(f'Jumlah adegan ({len(scenes)}) tidak sama dengan jumlah gambar ({len(imgs)})')
    voice = VOICES.get(j.get('suara', 'wanita'), VOICES['wanita'])
    rate = RATES.get(j.get('laju', 'normal'), '+0%')
    say(f'🎬 Membuat video {len(scenes)} adegan ({"gambar unggahan" if imgs else "render langsung, animasi"}), suara {j.get("suara", "wanita")}. Perkiraan 3 sampai 15 menit...')
    pub = f'{work}/public'
    os.makedirs(pub, exist_ok=True)
    names = [None] * len(scenes)
    for i, im in enumerate(imgs):
        ext = os.path.splitext(im.get('name', ''))[1].lower()
        ext = ext if ext in ('.png', '.jpg', '.jpeg', '.webp') else '.png'
        names[i] = f'img{i}{ext}'
        tgfile(im['id'], f'{pub}/{names[i]}')
    tl = build_timeline(p, pub, names, voice, rate)
    music = [f for f in sorted(os.listdir('music')) if f.lower().endswith(('.mp3', '.wav', '.m4a', '.ogg'))] if os.path.isdir('music') else []
    if music:
        m = random.choice(music); shutil.copy('music/' + m, f'{pub}/bg{os.path.splitext(m)[1]}'); tl['music'] = 'bg' + os.path.splitext(m)[1]
    else: tl['music'] = None
    json.dump(tl, open(f'{work}/timeline.json', 'w'), ensure_ascii=False)
    out = f'{work}/video.mp4'
    node('render/video.mjs', f'{work}/timeline.json', out, pub)
    if os.path.getsize(out) > MAX_TG:  # terlalu besar untuk bot Telegram: kecilkan
        small = f'{work}/video-kecil.mp4'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', out, '-vf', 'scale=720:-2', '-c:v', 'libx264', '-crf', '28',
                        '-preset', 'veryfast', '-c:a', 'copy', '-movflags', '+faststart', small], check=True)
        out = small
    if os.path.getsize(out) > MAX_TG: raise Exception('Video terlalu besar untuk dikirim lewat Telegram (%.0f MB)' % (os.path.getsize(out) / 1e6))
    dur = tl['totalFrames'] / FPS
    title = (p['header'].get('judul') or 'Video').replace('|', '-')
    send_video(out, f'{title}\n{len(scenes)} adegan · {int(dur // 60)}:{int(dur % 60):02d} · suara {j.get("suara", "wanita")}',
               *((720, 1280) if out.endswith('kecil.mp4') else (1080, 1920)))
    return f'video terkirim ({dur:.0f} dtk)'


JOBS = {'gambar': job_gambar, 'video': job_video}


def check():
    jobs = load('jobs.json', [])
    has = any(j.get('status') in ('new', 'processing') for j in jobs)
    print('has=' + ('true' if has else 'false'))
    if os.environ.get('GITHUB_OUTPUT'):
        open(os.environ['GITHUB_OUTPUT'], 'a').write('has=' + ('true' if has else 'false') + '\n')


def run():
    pull()
    jobs = load('jobs.json', [])
    for j in jobs:  # hanya satu job workflow berjalan sekaligus, jadi 'processing' = sisa proses yang terputus
        if j.get('status') == 'processing':
            j['status'] = 'error'; j['msg'] = 'Proses sebelumnya terputus (timeout). Kirim ulang job ini.'
    todo = [j for j in jobs if j.get('status') == 'new']
    if not todo: save('jobs.json', jobs); git('bot: bersihkan job'); return
    for j in todo: j['status'] = 'processing'
    save('jobs.json', jobs); git('bot: mulai job')
    for j in todo:
        work = f"work/{re.sub(r'[^A-Za-z0-9]', '', j['id'])}"
        shutil.rmtree(work, ignore_errors=True); os.makedirs(work, exist_ok=True)
        try:
            msg = JOBS[j['type']](j, work)
            patch_job(j['id'], status='done', msg=msg, finished=dt.datetime.now(dt.timezone.utc).isoformat())
        except Exception as e:
            err = str(e)[:500]
            say(f'❌ Job {j["type"]} gagal: {err}')
            patch_job(j['id'], status='error', msg=err)
        finally:
            shutil.rmtree(work, ignore_errors=True)


if __name__ == '__main__':
    {'run': run, 'check': check}[sys.argv[1] if len(sys.argv) > 1 else 'run']()
