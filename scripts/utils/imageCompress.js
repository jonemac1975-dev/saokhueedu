export function compressImage(file, maxW = 400) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = maxW / img.width;
      const canvas = document.createElement("canvas");
      canvas.width = maxW;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(b => resolve(b), "image/jpeg", 0.7);
    };
    img.src = URL.createObjectURL(file);
  });
}
