/**
 * Script para gerar ícones PNG a partir do SVG usando sharp
 * npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Tamanhos necessários para PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Verifica se o sharp está instalado, se não instala
try {
  require('sharp');
} catch (e) {
  console.log('Instalando sharp...');
  require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
}

const svgBuffer = fs.readFileSync(path.join(__dirname, 'base-icon.svg'));

const generateIcons = async () => {
  console.log('Gerando ícones PNG...');
  
  // Gera os ícones PWA
  for (const size of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `icon-${size}x${size}.png`));
      console.log(`✓ Gerado: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`Erro ao gerar icon-${size}x${size}.png:`, error);
    }
  }
  
  // Gera o favicon
  try {
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, '..', 'favicon.ico'));
    console.log('✓ Gerado: favicon.ico');
  } catch (error) {
    console.error('Erro ao gerar favicon:', error);
  }
  
  console.log('Conversão concluída!');
};

generateIcons().catch(console.error);