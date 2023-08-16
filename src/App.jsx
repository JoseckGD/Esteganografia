import React, { useState } from "react";
import "./App.css";

function App() {
  const [hiddenText, setHiddenText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [imageData, setImageData] = useState(null);
  const [imageSize, setImageSize] = useState(0);

  const [encodedImageData, setEncodedImageData] = useState(null);
  const [encodedImageSize, setEncodedImageSize] = useState(0);

  const [hiddenImage, setHiddenImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setEncodedImageData(event.target.result);
      setImageData(event.target.result);
      setImageSize(Math.round(event.total / 1024)); // Calcula el tamaño de la imagen cargada en KB
    };
    reader.readAsDataURL(file);
  };

  const handleEncode = () => {
    if (!selectedImage) {
      alert("Selecciona una imagen.");
      return;
    }

    if (hiddenText === "") {
      alert("Ingresa el texto que deseas ocultar.");
      return;
    }

    const imageCopy = new Image();
    imageCopy.src = encodedImageData;
    imageCopy.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = imageCopy.width;
      canvas.height = imageCopy.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageCopy, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 100; i++) {
        encodeText(imageData, hiddenText);
      }
      console.log("termino");

      ctx.putImageData(imageData, 0, 0);

      const encodedDataURL = canvas.toDataURL("image/webp");

      setHiddenImage(encodedDataURL);
      setEncodedImageData(encodedDataURL);
      setEncodedImageSize(Math.round(encodedDataURL.length / 1024)); // Calcula el tamaño de la nueva imagen codificada en KB
    };
  };

  const encodeText = (imageData, text) => {
    const textBytes = new TextEncoder().encode(text);
    let byteIndex = 0;

    //modifica el componente de color rojo de un píxel en la imagen para ocultar un bit del texto.
    //El bit menos significativo del componente de color rojo se modifica para coincidir con el bit
    //más significativo del byte del texto, permitiendo así ocultar información en la imagen.

    for (let i = 0; i < imageData.data.length; i += 4) {
      if (byteIndex < textBytes.length) {
        //R
        imageData.data[i] =
          (imageData.data[i] & 0xfe) | ((textBytes[byteIndex] & 0x80) >> 7);
        //G
        imageData.data[i + 1] =
          (imageData.data[i + 1] & 0xfe) | ((textBytes[byteIndex] & 0x40) >> 6);
        //B
        imageData.data[i + 2] =
          (imageData.data[i + 2] & 0xfe) | ((textBytes[byteIndex] & 0x20) >> 5);
        //ALPHA
        imageData.data[i + 3] =
          (imageData.data[i + 3] & 0xfe) | ((textBytes[byteIndex] & 0x10) >> 4);

        byteIndex++;
      }
    }
  };

  return (
    <div>
      <h1>Esteganografía en Imágenes WebP</h1>
      <section>
        <input type="file" accept=".webp" onChange={handleImageChange} />
        {imageData && (
          <div>
            <img src={imageData} alt="Imagen cargada" />
            <p>Tamaño de la imagen cargada: {imageSize} KB</p>
          </div>
        )}
      </section>
      <section>
        <input
          placeholder="Texto a ocultar"
          value={hiddenText}
          onChange={(e) => setHiddenText(e.target.value)}
        />
        <button onClick={handleEncode}>Ocultar en la imagen</button>
      </section>

      {hiddenImage && (
        <>
          <section>
            <div>
              <img src={hiddenImage} alt="Imagen oculta" />
              <p>Tamaño de la imagen oculta: {encodedImageSize} KB</p>
            </div>
          </section>
          <section>
            <a href={encodedImageData} download="encoded_image.webp">
              Descargar Imagen Oculta
            </a>
          </section>
        </>
      )}
    </div>
  );
}

export default App;
