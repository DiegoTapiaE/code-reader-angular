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
  @Input() cam_debounce: number = 300; // Si no se define un debounce tomará por defecto 300ms
  @Input() cam_code_type: string | undefined;
  @Output() on_detect: EventEmitter<any> = new EventEmitter(); 

  private barcode_detector: any;
  private last_detection_time: number = 0;
  public is_scanner_mode: boolean = true; 
  public manual_code: string = ''; // Código ingresado manualmente
  private last_detected_code: string = ''; // Último código detectado
  public detected_codes: string[] = []; // Lista de códigos detectados acumulados

  // Inicializa el detector de códigos de barras y la cámara si está soportado
  ngOnInit(): void {
    if ('BarcodeDetector' in window) {
      this.barcode_detector = new BarcodeDetector({
        formats: this.cam_code_type ? [this.cam_code_type] : ['qr_code', 'ean_13', 'code_128']
      });
      this.startCamera();
    } else {
      console.error('BarcodeDetector no está soportado en este navegador.');
    }
  }

  // Cambia entre el modo escáner y el modo manual
  toggleMode(): void {
    this.is_scanner_mode = !this.is_scanner_mode;
    if (this.is_scanner_mode) {
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
    const scan_interval = setInterval(() => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && this.is_scanner_mode) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Detecta códigos de barras usando el BarcodeDetector
        if (this.barcode_detector) {
          this.barcode_detector.detect(canvas)
            .then((barcodes: any) => {
              const current_time = Date.now();
              if (barcodes.length > 0) {
                const detected_code = barcodes[0].rawValue;
                // Emite el código si es diferente del último o si ha pasado el tiempo de debounce
                if (detected_code !== this.last_detected_code ||
                  (current_time - this.last_detection_time > this.cam_debounce)) {

                  this.on_detect.emit(detected_code); // Emitir el código detectado
                  this.last_detection_time = current_time;
                  this.last_detected_code = detected_code;

                  // Agregar el código detectado a la lista de códigos
                  this.detected_codes.push(detected_code);
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
    if (this.manual_code) {
      this.on_detect.emit(this.manual_code); // Emitir el código ingresado manualmente
      this.detected_codes.push(this.manual_code); // Agregar el código manual a la lista de códigos detectados
      this.manual_code = ''; // Limpiar el campo de entrada
    }
  }
}
