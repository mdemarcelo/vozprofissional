# Voz Profissional — Netlify + Pages CMS

Projeto editável do site de Marcelo Nascimento. **Não altere o domínio principal do Wix para testar.**

## O que vai em cada pasta

- `site/`: HTML, CSS, JS e imagens fixas da página.
- `content/midias/*.json`: cada vídeo/áudio é um item, editável pelo Pages CMS.
- `content/treinamentos/*.json`: cursos, workshops e ebooks.
- `media/imagens/` e `media/audios/`: uploads feitos pelo Pages CMS.
- `.pages.yml`: define os formulários do painel visual.
- `scripts/build.mjs`: gera automaticamente o site publicado.
- `dist/`: resultado gerado (não precisa subir ao GitHub).
- `netlify.toml`: configuração de publicação; começa em modo TESTE (`noindex`).

## Caminho recomendado

1. Descompacte este projeto em uma pasta do computador.
2. Com GitHub Desktop, crie um repositório a partir desta pasta; publique como **privado**.
3. No Netlify, use *Add new project → Import an existing project → GitHub* e selecione o repositório. A configuração `netlify.toml` cuidará do build (`node scripts/build.mjs`, publicação em `dist`).
4. No Pages CMS, entre em https://app.pagescms.org/ com GitHub, autorize somente esse repositório e abra-o.
5. Em **Portfólio**, edite um item ou use **New** para criar um novo. Marque `published` para aparecer; altere `order` para a posição. No campo URL cole YouTube HTTPS. Para áudio MP3 curto, selecione o campo de upload.
6. Clique **Save** no Pages CMS. Essa alteração vai ao GitHub e aciona a publicação automática do Netlify. Confirme a publicação na aba **Deploys** do Netlify.

**Nota:** Publicar apenas a pasta `dist/` via Netlify Drop cria uma prévia funcional, mas **não conecta o editor CMS**. Para atualizações automáticas, o repositório GitHub + deploy contínuo são indispensáveis.

## Como testar localmente

Instale Node.js 20+ e execute:

```bash
node scripts/build.mjs
cd dist
python3 -m http.server 8000
```

Abra http://localhost:8000 no navegador. Também há uma prévia pronta para testes em outro pacote ZIP.

## Mídias e limites

- Para vídeo, preferir link do YouTube; não carregar vídeos pesados no repositório.
- Para áudio, preferir MP3/M4A compactado para amostras; arquivos grandes devem ser hospedados em storage/serviço próprio e referenciados por HTTPS.
- Capas em JPG/WEBP; use imagem de capa opcional no Pages CMS.
- É possível despublicar trabalhos sem apagá-los.
- Alguns links antigos de vídeo podem impedir incorporação; conferir cada vídeo depois de publicar.

## Migração do domínio — NÃO executar agora

A configuração começa com `SITE_MODE = "staging"` (não indexar), para testar no endereço `*.netlify.app`.

**Se quiser colocar todo o domínio principal no Netlify:** primeiro mapear e preservar as URLs existentes no Wix, especialmente `/ebook`, `/treinamento`, `/blog` e eventuais checkouts/páginas de campanha, e verificar integrações e e-mail. DNS aponta **o host**, não divide pastas entre Netlify e Wix. Não altere DNS sem plano de redirecionamentos. Quando o site estiver pronto e URLs mapeadas, altere `SITE_MODE` para `production` no `netlify.toml` e publique novamente.

**Alternativa segura:** apontar apenas um subdomínio como `portfolio.vozprofissional.com` ao Netlify, mantendo `www.vozprofissional.com` no Wix. Configurar o CNAME conforme o endereço exato fornecido pelo Netlify.

Guia visual com instruções: `GUIA-PASSO-A-PASSO.html` (fornecido separadamente junto dos ZIPs).
