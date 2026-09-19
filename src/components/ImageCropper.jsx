import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";

function ImageCropper({ image, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  function confirmar() {
    if (!croppedAreaPixels) return;

    onConfirm(croppedAreaPixels);
  }

  return (
    <div className="image-cropper-overlay">
      <div className="image-cropper-modal">
        <div className="image-cropper-header">
          <div>
            <h2>Ajustar foto</h2>
            <p>Posicione sua foto dentro do círculo.</p>
          </div>

          <button
            type="button"
            className="image-cropper-fechar"
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <div className="image-cropper-area">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="image-cropper-controle">
          <span>Zoom</span>

          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </div>

        <div className="image-cropper-acoes">
          <button
            type="button"
            className="image-cropper-btn-cancelar"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="image-cropper-btn-confirmar"
            onClick={confirmar}
          >
            Confirmar foto
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;