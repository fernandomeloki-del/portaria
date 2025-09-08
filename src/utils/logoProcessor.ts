/**
 * Utility para processar e aplicar logos personalizados
 * Converte e aplica o logo do usuário em toda a aplicação
 */

export class LogoProcessor {
  private static async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private static async resizeImage(file: File, width: number, height: number): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = width;
        canvas.height = height;

        // Fundo transparente para PNGs
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          
          // Calcular proporções para manter aspecto
          const scale = Math.min(width / img.width, height / img.height);
          const x = (width - img.width * scale) / 2;
          const y = (height - img.height * scale) / 2;
          
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      };

      img.src = URL.createObjectURL(file);
    });
  }

  private static async createSVGFromImage(file: File): Promise<string> {
    const dataUrl = await this.fileToDataUrl(file);
    
    // Criar SVG embutindo a imagem
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" viewBox="0 0 512 512">
  <image href="${dataUrl}" x="0" y="0" width="512" height="512"/>
</svg>`;
    
    return svgContent;
  }

  static async generatePWAIcons(logoFile: File): Promise<{ [key: string]: Blob }> {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    const icons: { [key: string]: Blob } = {};

    for (const size of sizes) {
      const resizedBlob = await this.resizeImage(logoFile, size, size);
      icons[`icon-${size}x${size}.png`] = resizedBlob;
    }

    // Gerar favicon (32x32)
    const faviconBlob = await this.resizeImage(logoFile, 32, 32);
    icons['favicon.ico'] = faviconBlob;

    return icons;
  }

  static async createLogoSVG(logoFile: File): Promise<string> {
    if (logoFile.type === 'image/svg+xml') {
      // Se já é SVG, ler o conteúdo
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(logoFile);
      });
    } else {
      // Converter para SVG
      return this.createSVGFromImage(logoFile);
    }
  }

  static async processAndSaveLogos(logoFile: File, appName: string): Promise<void> {
    try {
      console.log('🔄 Iniciando processamento do logo...');

      // 1. Gerar SVG principal
      const logoSVG = await this.createLogoSVG(logoFile);
      
      // 2. Gerar ícones PWA
      const pwaIcons = await this.generatePWAIcons(logoFile);
      
      // 3. Salvar arquivos usando localStorage para demonstração
      // Em uma implementação real, isso seria feito via API
      const logoData = {
        mainSVG: logoSVG,
        baseIconSVG: logoSVG, // Usar o mesmo para base-icon.svg
        pwaIcons: Object.keys(pwaIcons).reduce((acc, key) => {
          acc[key] = URL.createObjectURL(pwaIcons[key]);
          return acc;
        }, {} as { [key: string]: string }),
        appName,
        timestamp: Date.now()
      };

      localStorage.setItem('custom_logo_data', JSON.stringify(logoData));
      
      // 4. Atualizar referências dinâmicas no DOM
      this.updateDOMReferences(logoData);
      
      console.log('✅ Logo processado e aplicado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao processar logo:', error);
      throw error;
    }
  }

  private static updateDOMReferences(logoData: any): void {
    // Atualizar favicon dinamicamente
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon && logoData.pwaIcons['favicon.ico']) {
      favicon.href = logoData.pwaIcons['favicon.ico'];
    }

    // Atualizar apple-touch-icon
    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (appleIcon && logoData.pwaIcons['icon-192x192.png']) {
      appleIcon.href = logoData.pwaIcons['icon-192x192.png'];
    }

    // Atualizar título se mudou
    if (logoData.appName && logoData.appName !== 'Entregas Zap') {
      document.title = `${logoData.appName} - Sistema de Gestão de Entregas`;
    }
  }

  static getStoredLogoData(): any | null {
    const stored = localStorage.getItem('custom_logo_data');
    return stored ? JSON.parse(stored) : null;
  }

  static hasCustomLogo(): boolean {
    const stored = this.getStoredLogoData();
    return stored && stored.mainSVG;
  }

  static getCustomLogoURL(): string | null {
    const stored = this.getStoredLogoData();
    if (stored && stored.mainSVG) {
      // Converter SVG para URL utilizável
      const blob = new Blob([stored.mainSVG], { type: 'image/svg+xml' });
      return URL.createObjectURL(blob);
    }
    return null;
  }
}