import React, { forwardRef, useEffect, useRef } from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';

interface QuillEditorProps extends ReactQuillProps {
  forwardedRef: React.Ref<ReactQuill>;
}

const QuillEditor = ({ forwardedRef, ...props }: QuillEditorProps) => {
  const editorRef = useRef<ReactQuill | null>(null);

  useEffect(() => {
    if (typeof forwardedRef === 'function') {
      forwardedRef(editorRef.current);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<ReactQuill | null>).current = editorRef.current;
    }
  }, [forwardedRef]);

  return <ReactQuill ref={editorRef} {...props} />;
};

const CustomQuillEditor = forwardRef<ReactQuill, ReactQuillProps>((props, ref) => (
  <QuillEditor {...props} forwardedRef={ref} />
));

export default CustomQuillEditor;
