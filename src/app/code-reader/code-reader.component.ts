import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
declare var BarcodeDetector: any;

@Component({
  selector: 'app-code-reader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-reader.component.html',
  styleUrl: './code-reader.component.css'
})
export class CodeReaderComponent implements OnInit {
  @Input() cam_debounce: number = 300; // Si no se define un debounce tomara por defecto 300ms
  @Input() cam_code_type: string | undefined;
  @Output() onDetect: EventEmitter<any> = new EventEmitter(); 

  private barcodeDetector: any;
  private lastDetectionTime: number = 0;
  public isScannerMode: boolean = true; 
  public manualCode: string = ''; // Código ingresado manualmente
  private lastDetectedCode: string = ''; // Último código detectado
  public detectedCodes: string[] = []; // Lista de códigos detectados acumulados

  // Inicializa el detector de códigos de barras y la cámara si está soportado
  ngOnInit(): void {
    if ('BarcodeDetector' in window) {
      this.barcodeDetector = new BarcodeDetector({
        formats: this.cam_code_type ? [this.cam_code_type] : ['qr_code', 'ean_13', 'code_128']
      });
      this.startCamera();
    } else {
      console.error('BarcodeDetector no está soportado en este navegador.');
    }
  }

  // Cambia entre el modo escáner y el modo manual
  toggleMode(): void {
    this.isScannerMode = !this.isScannerMode;
    if (this.isScannerMode) {
      this.startCamera();
    } else {
      this.stopCamera();
    }
  }

  // Inicia la cámara y configura el zoom si está disponible
  startCamera(): void {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        const video = document.querySelector('video') as HTMLVideoElement;
        video.srcObject = stream;
        video.play();

        // Configurar zoom si está disponible en el dispositivo
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;

        if (capabilities.zoom) {
          const settings = track.getSettings();
          track.applyConstraints({
            advanced: [{ [<any>'zoom']: capabilities.zoom.max / 3 }] // Ajusta el zoom según sea necesario
          }).catch(err => console.error("Error al aplicar zoom:", err));
        }

        video.addEventListener('play', () => {
          this.scanBarcode(video); // Inicia la detección de códigos en el video
        });
      })
      .catch((err) => {
        console.error('Error al acceder a la cámara: ', err);
      });
  }

  // Detiene la cámara y libera los recursos de video
  stopCamera(): void {
    const video = document.querySelector('video') as HTMLVideoElement;
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }

  // Escanea el video para detectar códigos de barras en intervalos definidos
  scanBarcode(video: HTMLVideoElement): void {
    const scanInterval = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && this.isScannerMode) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Detecta códigos de barras usando el BarcodeDetector
        if (this.barcodeDetector) {
          this.barcodeDetector.detect(canvas)
            .then((barcodes: any) => {
              const currentTime = Date.now();
              if (barcodes.length > 0) {
                const detectedCode = barcodes[0].rawValue;
                // Emite el código si es diferente del último o si ha pasado el tiempo de debounce
                if (detectedCode !== this.lastDetectedCode ||
                  (currentTime - this.lastDetectionTime > this.cam_debounce)) {

                  this.onDetect.emit(detectedCode); // Emitir el código detectado
                  this.lastDetectionTime = currentTime;
                  this.lastDetectedCode = detectedCode;

                  // Agregar el código detectado a la lista de códigos
                  this.detectedCodes.push(detectedCode);
                }
              }
            })
            .catch((err: any) => {
              console.error('Error detectando códigos de barras:', err);
            });
        }
      }
    }, 100); // Escanea cada 100 ms
  }

  // Agrega manualmente un código ingresado y lo emite
  manualSubmit(): void {
    if (this.manualCode) {
      this.onDetect.emit(this.manualCode); // Emitir el código ingresado manualmente
      this.detectedCodes.push(this.manualCode); // Agregar el código manual a la lista de códigos detectados
      this.manualCode = ''; // Limpiar el campo de entrada
    }
  }
}
