import sharp from 'sharp';

// No terminal/script puro, usamos apenas o caminho como string
const inputPath = './bg-synth.png'; 
const outputPath = 'bg-Synth.webp';

const converter = async () => {
  try {
    console.log('⏳ Iniciando conversão...');
    
    await sharp(inputPath)
      .webp({ quality: 80 }) // 80 é o equilíbrio perfeito entre peso e qualidade
      .toFile(outputPath);
    
    console.log('✅ Sucesso! Arquivo gerado:', outputPath);
  } catch (error) {
    // É importante tratar o erro caso o arquivo não exista ou o caminho esteja errado
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Erro na conversão:', errorMessage);
  }
};

converter();