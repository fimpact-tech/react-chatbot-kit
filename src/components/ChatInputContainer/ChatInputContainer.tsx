import React, { ChangeEvent, SetStateAction } from 'react';
import SendIcon from '../../assets/icons/custom/send.svg';
import DisabledSendIcon from '../../assets/icons/custom/send-gray.svg';
import AttachmentIcon from '../../assets/icons/custom/attachment.svg';
import RemoveIcon from '../../assets/icons/custom/remove.svg';
import { createChatMessage } from '../Chat/chatUtils';
import './ChatInputContainer.css';

interface ChatInputContainerProps {
  setState: React.Dispatch<SetStateAction<any>>;
  state: any;
  fileInput: File[] | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  input: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  setFileInputValue: React.Dispatch<React.SetStateAction<any>>;
  placeholder: string;
  handleSubmit: (e: React.FormEvent) => void;
  customButtonStyle: React.CSSProperties;
}

const ChatInputContainer: React.FC<ChatInputContainerProps> = ({
  setState,
  state,
  fileInput,
  fileInputRef,
  input,
  setInputValue,
  setFileInputValue,
  placeholder,
  handleSubmit,
  customButtonStyle,
}) => {
  const { isInputDisabled, isFileInputDisabled } = state;

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files) {
      return;
    }

    if (files.length > 5) {
      setState((prevState: any) => ({
        ...prevState,
        messages: [
          ...state.messages,
          createChatMessage('You can upload up to 5 files.', 'bot'),
        ],
      }));
      return;
    }

    setFileInputValue((prevFiles: File[] | null) => {
      if (prevFiles !== null) {
        return [...prevFiles, ...Array.from(files)];
      }
      return Array.from(files);
    });
  };

  const handleRemoveFile = (index: number) => {
    setFileInputValue((prevFiles: File[]) => {
      const newFiles = [
        ...prevFiles.slice(0, index),
        ...prevFiles.slice(index + 1),
      ];
      return newFiles;
    });
  };

  return (
    <div
      className={`react-chatbot-kit-chat-input-container ${
        isInputDisabled ? 'is-disabled' : ''
      }`}
    >
      <form
        className={`react-chatbot-kit-chat-input-form ${
          isInputDisabled ? 'is-disabled' : ''
        }`}
        onSubmit={handleSubmit}
      >
        {fileInput && fileInput.length > 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'start',
              height: '65px',
              overflowX: 'auto',
              paddingTop: '8px',
            }}
          >
            {fileInput.map((file, index) => (
              <div
                key={`file-div-${index}`}
                style={{
                  position: 'relative',
                  marginRight: index === 0 ? '0' : '10px',
                }}
              >
                <img
                  key={`file-image-${index}`}
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{
                    maxWidth: '60px',
                    maxHeight: '60px',
                    position: 'relative',
                  }}
                />
                <button
                  key={`file-remove-btn-${index}`}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: 'none',
                    border: 'none',
                  }}
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                >
                  <RemoveIcon style={{ width: '24px' }} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <textarea
            className={`react-chatbot-kit-chat-input ${
              isInputDisabled ? 'is-disabled' : ''
            }`}
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isInputDisabled}
          />
        )}

        <div className="react-chatbot-kit-chat-btn-container">
          <button
            type="button"
            className="react-chatbot-kit-chat-btn-attachement"
            disabled={isFileInputDisabled}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <input
              type="file"
              accept=".png,.jpg,.jpeg"
              multiple
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
              disabled={isFileInputDisabled}
            />
            <AttachmentIcon className="react-chatbot-kit-chat-btn-attachment-icon" />
          </button>
          <button
            className="react-chatbot-kit-chat-btn-send"
            style={customButtonStyle}
            disabled={isInputDisabled}
          >
            {isInputDisabled ? (
              <DisabledSendIcon className="react-chatbot-kit-chat-btn-send-icon" />
            ) : (
              <SendIcon className="react-chatbot-kit-chat-btn-send-icon" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInputContainer;
