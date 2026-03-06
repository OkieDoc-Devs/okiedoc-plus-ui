import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { FaTimes, FaCheck } from 'react-icons/fa';
import './ImageCropperModal.css';

const ImageCropperModal = ({ isOpen, imageSrc, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = (crop) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom) => {
        setZoom(zoom);
    };

    const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!croppedAreaPixels || !imageSrc) return;
        setIsProcessing(true);
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const file = new File([croppedImageBlob], 'profile.jpg', { type: 'image/jpeg' });
            onCropComplete(file);
        } catch (e) {
            console.error(e);
            alert('Failed to crop image');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <div className="cropper-modal-overlay">
            <div className="cropper-modal-content">
                <div className="cropper-modal-header">
                    <h3>Crop Profile Picture</h3>
                    <button className="cropper-close-btn" onClick={onCancel} disabled={isProcessing}>
                        <FaTimes />
                    </button>
                </div>

                <div className="cropper-container">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteCallback}
                        onZoomChange={onZoomChange}
                    />
                </div>

                <div className="cropper-controls">
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(e.target.value)}
                        className="zoom-range"
                        disabled={isProcessing}
                    />
                </div>

                <div className="cropper-modal-footer">
                    <button className="cropper-cancel-btn" onClick={onCancel} disabled={isProcessing}>
                        Cancel
                    </button>
                    <button className="cropper-save-btn" onClick={handleSave} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : <><FaCheck /> Apply</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropperModal;
