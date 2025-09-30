const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateOGImage() {
  try {
    // SVG 파일 읽기
    const svgPath = path.join(__dirname, '../public/og-image.svg');
    const svgBuffer = fs.readFileSync(svgPath);
    
    // SVG를 PNG로 변환 (1200x630)
    const pngBuffer = await sharp(svgBuffer)
      .resize(1200, 630)
      .png()
      .toBuffer();
    
    // PNG 파일 저장
    const pngPath = path.join(__dirname, '../public/og-image.png');
    fs.writeFileSync(pngPath, pngBuffer);
    
    console.log('✅ OG 이미지가 성공적으로 생성되었습니다: og-image.png');
    console.log('📏 크기: 1200x630px');
    console.log('📁 위치: public/og-image.png');
    
  } catch (error) {
    console.error('❌ OG 이미지 생성 중 오류 발생:', error);
  }
}

generateOGImage();
