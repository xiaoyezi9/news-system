import React, { useEffect, useState } from 'react'
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs'
import { convertToRaw, EditorState, ContentState } from 'draft-js';

export default function NewsEditor(props) {
  const [editorState, seteditorState] = useState("")
  useEffect(() => {
    const html = props.content;
    if(html===undefined) return 
    const contentBlock = htmlToDraft(html);
    if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);
        seteditorState(editorState)
    }
  }, [props.content])
  
  return (
    <Editor
    editorState={editorState}
  toolbarClassName="toolbarClassName"
  wrapperClassName="wrapperClassName"
  editorClassName="editorClassName"
  onEditorStateChange={(editorState) => {
    seteditorState(editorState)
}}
onBlur={() => {
 props.getCurrent(draftToHtml(convertToRaw(editorState.getCurrentContent())))
}}
 />
  )
}
