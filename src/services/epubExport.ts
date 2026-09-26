import JSZip from 'jszip';
import { Project } from '../types';

/**
 * Generates an authentic, valid EPUB 3.0 file from the project chapters.
 */
export async function generateEpubBlob(project: Project): Promise<Blob> {
  const zip = new JSZip();

  // 1. mimetype (MUST be first, uncompressed)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  zip.folder('META-INF')!.file(
    'container.xml',
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`
  );

  const oebps = zip.folder('OEBPS')!;
  const uuid = `urn:uuid:${project.id || 'bookforge-pub-' + Date.now()}`;
  const now = new Date().toISOString().split('T')[0];

  // 3. Stylesheet
  const cssContent = `
body {
  font-family: 'Newsreader', Georgia, serif;
  font-size: 1.15em;
  line-height: 1.7;
  color: #1a1a1a;
  margin: 1.5em;
  text-align: justify;
}
h1, h2, h3 {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  text-align: center;
  margin-top: 1.5em;
  margin-bottom: 0.8em;
  color: #111;
}
h1.title {
  font-size: 2.2em;
  margin-top: 2em;
  letter-spacing: 0.05em;
}
p {
  margin: 0 0 1em 0;
  text-indent: 1.2em;
}
p.opening {
  text-indent: 0;
}
p.opening::first-letter {
  font-size: 3em;
  float: left;
  line-height: 0.8;
  margin: 0.1em 0.15em 0 0;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: bold;
}
.meta-block {
  text-align: center;
  margin-top: 3em;
  font-style: italic;
  color: #666;
}
.divider {
  text-align: center;
  margin: 2em 0;
  color: #888;
}
`;
  oebps.file('stylesheet.css', cssContent);

  // 4. Images directory & parsing
  const imagesFolder = oebps.folder('images')!;
  const imageManifestItems: { id: string; href: string; mediaType: string; properties?: string }[] = [];

  // 4a. Cover Image
  let coverPageHtml = '';
  if (project.coverConfig?.coverImageUrl) {
    const parsed = parseDataUrl(project.coverConfig.coverImageUrl);
    if (parsed) {
      const coverFilename = `cover.${parsed.ext}`;
      imagesFolder.file(coverFilename, parsed.data);
      imageManifestItems.push({
        id: 'cover-image',
        href: `images/${coverFilename}`,
        mediaType: parsed.mime,
        properties: 'cover-image'
      });

      coverPageHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Cover</title>
  <style type="text/css">
    body { margin: 0; padding: 0; text-align: center; background-color: #000000; }
    img { max-width: 100%; max-height: 100vh; height: auto; object-fit: contain; }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <img src="images/${coverFilename}" alt="Cover"/>
  </div>
</body>
</html>`;
      oebps.file('cover.xhtml', coverPageHtml);
    }
  }

  // 4b. Title page
  const titleHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${escapeXml(project.title)}</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css"/>
</head>
<body>
  <div style="text-align: center; padding-top: 4em;">
    <h1 class="title">${escapeXml(project.title)}</h1>
    <h3 style="font-weight: normal; color: #555;">${escapeXml(project.subtitle || '')}</h3>
    <div style="margin: 3em 0;">
      <p class="opening" style="font-size: 1.2em; letter-spacing: 0.1em; font-family: 'Cinzel', serif;">BY ${escapeXml(project.author.toUpperCase())}</p>
    </div>
    <div class="meta-block">
      <p>Published via BookForge AI Publishing Platform</p>
      <p style="font-size: 0.85em; color: #888;">Publication Date: ${now}</p>
    </div>
  </div>
</body>
</html>`;
  oebps.file('titlepage.xhtml', titleHtml);

  // 5. Chapters
  const validChapters = project.chapters.filter((c) => c.prose && c.prose.trim().length > 0);
  validChapters.forEach((chap, idx) => {
    let illustrationHtml = '';
    if (chap.illustrationUrl) {
      const parsed = parseDataUrl(chap.illustrationUrl);
      if (parsed) {
        const imgName = `chap_${chap.chapterNumber}.${parsed.ext}`;
        imagesFolder.file(imgName, parsed.data);
        const imgId = `img-chap-${chap.chapterNumber}`;
        imageManifestItems.push({
          id: imgId,
          href: `images/${imgName}`,
          mediaType: parsed.mime
        });

        illustrationHtml = `
    <figure style="text-align: center; margin: 2em 0;">
      <img src="images/${imgName}" alt="Illustration: ${escapeXml(chap.title)}" style="max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
      ${chap.illustrationCaption ? `<figcaption style="font-size: 0.85em; font-style: italic; color: #666; margin-top: 0.6em;">${escapeXml(chap.illustrationCaption)}</figcaption>` : ''}
    </figure>`;
      }
    }

    const paragraphs = chap.prose
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const parasHtml = paragraphs
      .map((p, pIdx) => `<p class="${pIdx === 0 ? 'opening' : ''}">${escapeXml(p)}</p>`)
      .join('\n    ');

    const chapHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Chapter ${chap.chapterNumber}: ${escapeXml(chap.title)}</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css"/>
</head>
<body>
  <section epub:type="chapter" role="doc-chapter">
    <h2>Chapter ${chap.chapterNumber}</h2>
    <h3 style="font-weight: normal; font-size: 1.3em; margin-bottom: 2em;">${escapeXml(chap.title)}</h3>
    ${illustrationHtml}
    ${parasHtml}
  </section>
</body>
</html>`;
    oebps.file(`chapter_${idx + 1}.xhtml`, chapHtml);
  });

  // 6. Navigation doc (nav.xhtml)
  const navHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="stylesheet.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
      ${coverPageHtml ? '<li><a href="cover.xhtml">Cover</a></li>' : ''}
      <li><a href="titlepage.xhtml">Title Page</a></li>
      ${validChapters.map((c, idx) => `<li><a href="chapter_${idx + 1}.xhtml">Chapter ${c.chapterNumber}: ${escapeXml(c.title)}</a></li>`).join('\n      ')}
    </ol>
  </nav>
</body>
</html>`;
  oebps.file('nav.xhtml', navHtml);

  // 7. NCX (toc.ncx for EPUB 2 backward compatibility)
  let playOrder = 1;
  const ncxHtml = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${uuid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(project.title)}</text></docTitle>
  <navMap>
    ${coverPageHtml ? `<navPoint id="navPoint-${playOrder++}" playOrder="${playOrder}"><navLabel><text>Cover</text></navLabel><content src="cover.xhtml"/></navPoint>` : ''}
    <navPoint id="navPoint-${playOrder++}" playOrder="${playOrder}">
      <navLabel><text>Title Page</text></navLabel>
      <content src="titlepage.xhtml"/>
    </navPoint>
    ${validChapters
      .map(
        (c, idx) => `
    <navPoint id="navPoint-${playOrder++}" playOrder="${playOrder}">
      <navLabel><text>Chapter ${c.chapterNumber}: ${escapeXml(c.title)}</text></navLabel>
      <content src="chapter_${idx + 1}.xhtml"/>
    </navPoint>`
      )
      .join('')}
  </navMap>
</ncx>`;
  oebps.file('toc.ncx', ncxHtml);

  // 8. OPF package file
  const opfContent = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${uuid}</dc:identifier>
    <dc:title>${escapeXml(project.title)}</dc:title>
    <dc:creator>${escapeXml(project.author)}</dc:creator>
    <dc:language>${escapeXml(project.intent.language || 'en')}</dc:language>
    <dc:date>${now}</dc:date>
    <dc:publisher>BookForge AI</dc:publisher>
    <dc:description>${escapeXml(project.intent.logline || '')}</dc:description>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="style" href="stylesheet.css" media-type="text/css"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${coverPageHtml ? '<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>' : ''}
    <item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>
    ${validChapters
      .map((_, idx) => `<item id="chapter_${idx + 1}" href="chapter_${idx + 1}.xhtml" media-type="application/xhtml+xml"/>`)
      .join('\n    ')}
    ${imageManifestItems
      .map((img) => `<item id="${img.id}" href="${img.href}" media-type="${img.mediaType}"${img.properties ? ` properties="${img.properties}"` : ''}/>`)
      .join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${coverPageHtml ? '<itemref idref="cover"/>' : ''}
    <itemref idref="titlepage"/>
    <itemref idref="nav"/>
    ${validChapters.map((_, idx) => `<itemref idref="chapter_${idx + 1}"/>`).join('\n    ')}
  </spine>
</package>`;
  oebps.file('content.opf', opfContent);

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
}

function parseDataUrl(dataUrl: string): { mime: string; data: string | Uint8Array; ext: string } | null {
  if (!dataUrl || !dataUrl.startsWith('data:')) return null;
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return null;
  const header = dataUrl.slice(5, commaIdx);
  const rawData = dataUrl.slice(commaIdx + 1);
  const isBase64 = header.includes(';base64');
  const mime = header.split(';')[0] || 'image/png';
  const ext = mime.includes('svg') ? 'svg' : mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : 'png';

  if (isBase64) {
    try {
      const binStr = atob(rawData);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) {
        bytes[i] = binStr.charCodeAt(i);
      }
      return { mime, data: bytes, ext };
    } catch {
      return null;
    }
  } else {
    try {
      const decoded = decodeURIComponent(rawData);
      return { mime, data: decoded, ext };
    } catch {
      return { mime, data: rawData, ext };
    }
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportProjectToJson(project: Project) {
  const data = JSON.stringify(project, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const filename = `${sanitizeFilename(project.title)}_bookforge_project.json`;
  downloadBlob(blob, filename);
}

export function exportProjectToDocxHtml(project: Project) {
  const validChapters = project.chapters.filter((c) => c.prose && c.prose.trim().length > 0);
  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeXml(project.title)}</title>
  <style>
    body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; line-height: 1.6; margin: 1in; color: #000; }
    h1 { text-align: center; font-size: 24pt; margin-top: 1in; margin-bottom: 0.2in; }
    h2 { text-align: center; font-size: 16pt; margin-bottom: 0.5in; color: #444; }
    h3 { font-size: 14pt; margin-top: 0.4in; margin-bottom: 0.2in; }
    p { text-indent: 0.5in; margin: 0 0 0.1in 0; }
    p.author { text-align: center; font-size: 14pt; text-indent: 0; margin-bottom: 1in; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <h1>${escapeXml(project.title)}</h1>
  <h2>${escapeXml(project.subtitle || '')}</h2>
  <p class="author">By ${escapeXml(project.author)}</p>
  <div class="page-break"></div>

  ${validChapters
    .map(
      (chap) => `
    <div class="page-break"></div>
    <h3>Chapter ${chap.chapterNumber}: ${escapeXml(chap.title)}</h3>
    ${chap.prose
      .split(/\n\s*\n/)
      .map((p) => `<p>${escapeXml(p)}</p>`)
      .join('\n')}
  `
    )
    .join('\n')}
</body>
</html>`;

  const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
  const filename = `${sanitizeFilename(project.title)}.doc`;
  downloadBlob(blob, filename);
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeFilename(name: string): string {
  return (name || 'project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
