import React, { useRef, useState, useEffect } from "react";
import { uploadTransformerCurrent, getTransformerBaseImage } from "./API";

export default function ThermalImageUpload({ transformerNo, inspections }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadFile, setUploadFile] = useState(null);
  const [thermalImages, setThermalImages] = useState([]);
  const [baselineImage, setBaselineImage] = useState(null);
  const [weather, setWeather] = useState("Sunny");

  const thermalInputRef = useRef(null);
  const uploadInterval = useRef(null);

  // Load baseline + thermal images from backend
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const baselineUrl = await getTransformerBaseImage(transformerNo);
        setBaselineImage(baselineUrl);

        if (inspections.length > 0) {
          const thermalUrl = await getTransformerBaseImage(transformerNo, inspections[0].inspectionNo);
          setThermalImages([[thermalUrl, inspections[0].inspected, ""]]);
        }
      } catch (err) {
        console.error("Error loading images", err);
      }
    };
    fetchImages();
  }, [transformerNo, inspections]);

  const handleThermalClick = () => thermalInputRef.current.click();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadFile(file);
    setUploading(true);
    setProgress(0);

    uploadInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval.current);
          setUploading(false);

          uploadTransformerCurrent(file, transformerNo, inspections[0].inspectionNo)
            .then(() => getTransformerBaseImage(transformerNo, inspections[0].inspectionNo))
            .then(url => setThermalImages([[url, new Date().toLocaleDateString(), new Date().toLocaleTimeString()]]))
            .catch(err => console.error("Upload failed", err));

          return 100;
        }
        return prev + 1;
      });
    }, 50);
  };

  const handleCancelUpload = () => {
    clearInterval(uploadInterval.current);
    setUploading(false);
    setProgress(0);
    setUploadFile(null);
  };

  const hasThermal = thermalImages.length > 0 && thermalImages[0][0];

  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 transition-all duration-300">
      {uploading ? (
        <>
          <div className="flex flex-col items-center justify-center h-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Thermal Image Uploading</h3>
            <p className="text-gray-600 mb-4">Thermal image is being uploaded and reviewed.</p>
          </div>
          <div className="mb-2 flex justify-end">
            <span className="text-sm text-gray-700 font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-indigo-200 rounded-full h-4 overflow-hidden mb-4">
            <div className="bg-indigo-600 h-4 transition-all duration-200" style={{ width: `${progress}%` }}></div>
          </div>
          <button className="bg-white text-gray-600 px-4 py-2 rounded border border-gray-400 hover:bg-gray-100 w-auto" onClick={handleCancelUpload}>
            Cancel
          </button>
        </>
      ) : !hasThermal ? (
        <>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Thermal Image</h3>
          <p className="text-gray-600 mb-4">Upload a thermal image of the transformer to identify potential issues.</p>
          <label className="text-lg font-bold text-gray-800 mb-2 block">Weather Condition</label>
          <select value={weather} onChange={(e) => setWeather(e.target.value)} className="border rounded px-3 py-2 mb-4 w-full">
            <option value="Sunny">Sunny</option>
            <option value="Cloudy">Cloudy</option>
            <option value="Rainy">Rainy</option>
          </select>
          <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700" onClick={handleThermalClick}>
            Upload Thermal Image
          </button>
          <input type="file" ref={thermalInputRef} className="hidden" onChange={handleFileChange} />
        </>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Thermal Image Comparison</h3>
          <div className="grid grid-cols-2 gap-4 w-full">
            {baselineImage && (
              <div className="flex flex-col items-center relative">
                <img src={baselineImage} alt="Baseline" className="w-full h-64 object-cover rounded-lg bg-gray-100" />
                <span className="absolute top-1 right-1 bg-gray-700 text-white text-xs px-1 rounded">Baseline</span>
              </div>
            )}
            {thermalImages.map((imgData, i) => (
              <div key={`t-${i}`} className="flex flex-col items-center relative">
                <img src={imgData[0]} alt={`Thermal ${i}`} className="w-full h-64 object-cover rounded-lg bg-gray-100" />
                <span className="text-xs text-gray-500 mt-1">{imgData[1]} {imgData[2]}</span>
                <span className="absolute top-1 right-1 bg-indigo-600 text-white text-xs px-1 rounded">Current</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
