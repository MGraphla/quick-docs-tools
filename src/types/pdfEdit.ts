
export interface EditedFile {
  name: string;
  url: string;  
  size: string;
}

export interface PdfEdit {
  type: 'text' | 'highlight' | 'shape' | 'image';
  page: number;
  x: number;
  y: number;
  content?: string;
  fontSize?: number;
  color?: string;
  width?: number;
  height?: number;
  shapeType?: 'rectangle' | 'circle';
  imageData?: string;
}
