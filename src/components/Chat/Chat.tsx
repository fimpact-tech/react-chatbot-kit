import React, {
  useState,
  useRef,
  useEffect,
  SetStateAction,
  ChangeEvent,
} from 'react';
import ConditionallyRender from 'react-conditionally-render';

import UserChatMessage from '../UserChatMessage/UserChatMessage';
import ChatbotMessage from '../ChatbotMessage/ChatbotMessage';

import {
  botMessage,
  userMessage,
  customMessage,
  createChatMessage,
} from './chatUtils';

import SendIcon from '../../assets/icons/custom/send.svg';
import DisabledSendIcon from '../../assets/icons/custom/send-gray.svg';
import AttachmentIcon from '../../assets/icons/custom/attachment.svg';
import RemoveIcon from '../../assets/icons/custom/remove.svg';

import './Chat.css';
import {
  ICustomComponents,
  ICustomMessage,
  ICustomStyles,
} from '../../interfaces/IConfig';
import { IMessage } from '../../interfaces/IMessages';
import { string } from 'prop-types';

interface IChatProps {
  setState: React.Dispatch<SetStateAction<any>>;
  widgetRegistry: any;
  messageParser: any;
  actionProvider: any;
  customComponents: ICustomComponents;
  botName: string;
  customStyles: ICustomStyles;
  headerText: string;
  customMessages: ICustomMessage;
  placeholderText: string;
  validator: (input: string) => Boolean;
  state: any;
  disableScrollToBottom: boolean;
  messageHistory: IMessage[] | string;
  parse?: (message: string, fileInput?: File[]) => void;
  actions?: object;
  messageContainerRef: React.MutableRefObject<HTMLDivElement>;
}

const Chat = ({
  state,
  setState,
  widgetRegistry,
  messageParser,
  parse,
  customComponents,
  actionProvider,
  botName,
  customStyles,
  headerText,
  customMessages,
  placeholderText,
  validator,
  disableScrollToBottom,
  messageHistory,
  actions,
  messageContainerRef,
}: IChatProps) => {
  const { messages, isInputDisabled, isFileInputDisabled } = state;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInputValue] = useState('');
  const [fileInput, setFileInputValue] = useState<File[] | null>(null);

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

  const scrollIntoView = () => {
    setTimeout(() => {
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop =
          messageContainerRef?.current?.scrollHeight;
      }
    }, 50);
  };

  useEffect(() => {
    if (disableScrollToBottom) return;
    scrollIntoView();
  });

  const showAvatar = (messages: any[], index: number) => {
    if (index === 0) return true;

    const lastMessage = messages[index - 1];

    if (lastMessage.type === 'bot' && !lastMessage.widget) {
      return false;
    }
    return true;
  };

  const renderMessages = () => {
    return messages.map((messageObject: IMessage, index: number) => {
      if (botMessage(messageObject)) {
        return (
          <React.Fragment key={messageObject.id}>
            {renderChatbotMessage(messageObject, index)}
          </React.Fragment>
        );
      }

      if (userMessage(messageObject)) {
        return (
          <React.Fragment key={messageObject.id}>
            {renderUserMessage(messageObject)}
          </React.Fragment>
        );
      }

      if (customMessage(messageObject, customMessages)) {
        return (
          <React.Fragment key={messageObject.id}>
            {renderCustomMessage(messageObject)}
          </React.Fragment>
        );
      }
    });
  };

  const renderCustomMessage = (messageObject: IMessage) => {
    const customMessage = customMessages[messageObject.type];

    const props = {
      setState,
      state,
      scrollIntoView,
      actionProvider,
      payload: messageObject.payload,
      actions,
    };

    if (messageObject.widget) {
      const widget = widgetRegistry.getWidget(messageObject.widget, {
        ...state,
        scrollIntoView,
        payload: messageObject.payload,
        actions,
      });
      return (
        <>
          {customMessage(props)}
          {widget ? widget : null}
        </>
      );
    }

    return customMessage(props);
  };

  const renderUserMessage = (messageObject: IMessage) => {
    const widget = widgetRegistry.getWidget(messageObject.widget, {
      ...state,
      scrollIntoView,
      payload: messageObject.payload,
      actions,
    });
    return (
      <>
        <UserChatMessage
          message={messageObject.message}
          attachments={messageObject.attachments}
          key={messageObject.id}
          customComponents={customComponents}
        />
        {widget ? widget : null}
      </>
    );
  };

  const renderChatbotMessage = (messageObject: IMessage, index: number) => {
    let withAvatar;
    if (messageObject.withAvatar) {
      withAvatar = messageObject.withAvatar;
    } else {
      withAvatar = showAvatar(messages, index);
    }

    const chatbotMessageProps = {
      ...messageObject,
      setState,
      state,
      customComponents,
      widgetRegistry,
      messages,
      actions,
    };

    if (messageObject.widget) {
      const widget = widgetRegistry.getWidget(chatbotMessageProps.widget, {
        ...state,
        scrollIntoView,
        payload: messageObject.payload,
        actions,
      });
      return (
        <>
          <ChatbotMessage
            customStyles={customStyles.botMessageBox}
            withAvatar={withAvatar}
            {...chatbotMessageProps}
            key={messageObject.id}
          />
          <ConditionallyRender
            condition={!chatbotMessageProps.loading}
            show={widget ? widget : null}
          />
        </>
      );
    }

    return (
      <ChatbotMessage
        customStyles={customStyles.botMessageBox}
        key={messageObject.id}
        withAvatar={withAvatar}
        {...chatbotMessageProps}
        customComponents={customComponents}
        messages={messages}
        setState={setState}
      />
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validator && typeof validator === 'function') {
      if (validator(input) || (fileInput && fileInput.length > 0)) {
        handleValidMessage();
        if (parse) {
          return parse(input, fileInput);
        }
        messageParser.parse(input, fileInput);
      }
    } else {
      handleValidMessage();
      if (parse) {
        return parse(input, fileInput);
      }
      messageParser.parse(input, fileInput);
    }
  };

  const handleValidMessage = () => {
    setState((prevState: any) => {
      const newState = {
        ...prevState,
        messages: [
          ...state.messages,
          createChatMessage(input, 'user', fileInput),
        ],
      };

      scrollIntoView();
      setInputValue('');
      setFileInputValue(null);

      return newState;
    });
  };

  const customButtonStyle = { backgroundColor: '' };
  if (customStyles && customStyles.chatButton) {
    customButtonStyle.backgroundColor = customStyles.chatButton.backgroundColor;
  }

  let header = `Conversation with ${botName}`;
  if (headerText) {
    header = headerText;
  }

  let placeholder = 'Write your message here';
  if (placeholderText) {
    placeholder = placeholderText;
  }

  return (
    <div className="react-chatbot-kit-chat-container">
      <div className="react-chatbot-kit-chat-inner-container">
        <ConditionallyRender
          condition={!!customComponents.header}
          show={
            customComponents.header && customComponents.header(actionProvider)
          }
          elseShow={
            <div className="react-chatbot-kit-chat-header">{header}</div>
          }
        />

        <div
          className="react-chatbot-kit-chat-message-container"
          ref={messageContainerRef}
        >
          <ConditionallyRender
            condition={
              typeof messageHistory === 'string' && Boolean(messageHistory)
            }
            show={
              <div
                dangerouslySetInnerHTML={{ __html: messageHistory as string }}
              />
            }
          />

          {renderMessages()}
          <div style={{ paddingBottom: '15px' }} />
        </div>

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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {fileInput.map((file, index) => (
                  <div
                    key={`file-div-${index}`}
                    style={{ position: 'relative', marginRight: '10px' }}
                  >
                    <img
                      key={`file-image-${index}`}
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      style={{
                        maxHeight: '100px',
                        maxWidth: '100px',
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && 'form' in e.target) {
                    handleSubmit(e);
                    e.preventDefault();
                  }
                }}
                disabled={isInputDisabled}
              />
            )}

            <div className="react-chatbot-kit-chat-btn-container">
              <button
                type="button"
                disabled={isFileInputDisabled}
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
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
      </div>
    </div>
  );
};

export default Chat;
