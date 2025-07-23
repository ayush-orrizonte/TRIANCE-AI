import React, { useRef, useState } from "react";
import { Modal, Button, Container } from "@mantine/core";
import { Cropper } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
//import { IoMdClose } from "react-icons/io";

interface ImageCropperProps {
  isOpen: boolean;               
  onClose: () => void;           
  imageSrc: string;             
  onSave: (croppedFile: File) => void; 
}

const ImageCropper: React.FC<ImageCropperProps> = ({ isOpen, onClose, imageSrc, onSave }) => {
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const cropperRef = useRef<any>(null);

  const handleCrop = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.getCanvas();
      if (canvas) {
        canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            const croppedFile = new File([blob], "cropped_image.jpg", {
              type: blob.type,
            });
            const croppedUrl = URL.createObjectURL(blob);
            setCroppedImage(croppedUrl);
            onSave(croppedFile); 
            onClose();
          }
        });
      }
    }
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Crop Image" centered size="lg">
      <Container>
        <div style={{ width: "100%", height: "400px" }}>
          {imageSrc && ( 
            <Cropper
              ref={cropperRef}
              src={imageSrc}
              style={{ width: "100%", height: "100%" }}
            />
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px"}}>
          <Button variant="filled" color="#990007"  onClick={handleCrop}>
            Confirm
          </Button>
        </div>
      </Container>
    </Modal>
  );
};

export default ImageCropper;
