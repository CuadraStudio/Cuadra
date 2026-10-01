#!/usr/bin/env python3
"""Cambia el sitio entre dos modos sin tocar el diseño.

  python3 scripts/site-mode.py hidden   # en la raiz "/" se ve solo el sitio en construccion
  python3 scripts/site-mode.py live     # en la raiz "/" se ve la web completa
  python3 scripts/site-mode.py status   # muestra el modo actual

hidden:
  - index.html          = sitio en construccion (indexable)
  - index-web.html      = home completa (noindex, sin enlaces desde "/")
  - paginas publicas    = noindex
  - sitemap.xml         = solo "/"
live:
  - index.html          = home completa (indexable)
  - proximamente.html   = sitio en construccion (noindex, sin enlaces)
  - paginas publicas    = indexables (Blog, Demos y 404 siguen noindex)
  - sitemap.xml         = todas las paginas publicas

El script solo renombra archivos y ajusta <meta robots>, canonical y sitemap.
Usar desde la raiz del repo. Despues: git add -A && git commit && git push.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'https://cuadrastudio.uy'
PUBLIC = ['productos', 'armar-plan', 'diferencias', 'contacto', 'aviso-legal', 'privacidad']
NOINDEX = '  <meta name="robots" content="noindex, nofollow">\n'
CANON = re.compile(r'(  <link rel="canonical" href=")[^"]*(">\n)')


def p(name):
    return os.path.join(ROOT, name)


def read(name):
    with open(p(name), encoding='utf-8') as f:
        return f.read()


def write(name, text):
    with open(p(name), 'w', encoding='utf-8') as f:
        f.write(text)


def set_noindex(name, on):
    s = read(name)
    s = s.replace(NOINDEX, '')
    if on:
        s = CANON.sub(lambda m: m.group(0) + NOINDEX, s, count=1)
    write(name, s)


def set_canonical(name, path):
    s = read(name)
    s = CANON.sub(lambda m: m.group(1) + BASE + path + m.group(2), s, count=1)
    write(name, s)


def sitemap(paths):
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path in paths:
        prio = '1.0' if path == '/' else ('0.8' if path in ('/productos.html', '/armar-plan.html') else '0.5')
        out += ['  <url>', f'    <loc>{BASE}{path}</loc>', '    <lastmod>2026-10-01</lastmod>',
                '    <changefreq>monthly</changefreq>', f'    <priority>{prio}</priority>', '  </url>']
    out.append('</urlset>')
    write('sitemap.xml', '\n'.join(out) + '\n')


def mode():
    return 'hidden' if os.path.exists(p('index-web.html')) else 'live'


def to_hidden():
    if mode() == 'hidden':
        return
    os.rename(p('index.html'), p('index-web.html'))
    os.rename(p('proximamente.html'), p('index.html'))
    set_canonical('index-web.html', '/index-web.html')
    set_noindex('index-web.html', True)
    set_canonical('index.html', '/')
    set_noindex('index.html', False)
    for n in PUBLIC:
        set_noindex(n + '.html', True)
    sitemap(['/'])


def to_live():
    if mode() == 'live':
        return
    os.rename(p('index.html'), p('proximamente.html'))
    os.rename(p('index-web.html'), p('index.html'))
    set_canonical('proximamente.html', '/proximamente.html')
    set_noindex('proximamente.html', True)
    set_canonical('index.html', '/')
    set_noindex('index.html', False)
    for n in PUBLIC:
        set_noindex(n + '.html', False)
    sitemap(['/'] + ['/' + n + '.html' for n in PUBLIC])


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'status'
    if cmd == 'hidden':
        to_hidden()
    elif cmd == 'live':
        to_live()
    elif cmd != 'status':
        sys.exit(__doc__)
    print('modo actual:', mode())
