import imageCompression from "browser-image-compression";

export async function getCroppedImage(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Não foi possível processar a imagem."));
        }
      },
      "image/jpeg",
      0.9
    );
  });

  const arquivo = new File([blob], "foto-perfil.jpg", {
    type: "image/jpeg",
  });

  const comprimida = await imageCompression(arquivo, {
    maxSizeMB: 2,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  if (comprimida.size > 2 * 1024 * 1024) {
    throw new Error("A imagem processada ainda ultrapassa 2 MB.");
  }

  return comprimida;
}

function createImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Não foi possível carregar a imagem."));

    image.src = src;
  });
}