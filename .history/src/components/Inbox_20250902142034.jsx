

// working good


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// export default function Inbox({ messages }) {
//   const [selectedMsg, setSelectedMsg] = useState(null);
//   const [messageContent, setMessageContent] = useState(null);
//   const [loadingContent, setLoadingContent] = useState(false);
  
//   useEffect(() => {
//     if (selectedMsg) {
//       setLoadingContent(true);
//       axios.get(`${API_BASE}/inbox/content/${selectedMsg.token}/${selectedMsg.id}`)
//         .then(res => setMessageContent(res.data))
//         .catch(err => {
//           setMessageContent({
//             text: 'Failed to load content: ' + err.message,
//             html: '<p>Failed to load content</p>'
//           });
//         })
//         .finally(() => setLoadingContent(false));
//     }
//   }, [selectedMsg]);

//   const formatDate = (dateString) => new Date(dateString).toLocaleString();

//   if (!messages.length) {
//     return (
//       <div className="card border-0 shadow-sm">
//         <div className="card-body text-center py-5">
//           <h5 className="text-muted">Your inbox is empty</h5>
//           <p className="text-muted">Emails will appear here automatically</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="card border-0 shadow-sm">
//         <div className="card-header bg-white">
//           <h5 className="mb-0">Inbox ({messages.length})</h5>
//         </div>
//         <div className="list-group list-group-flush">
//           {messages.map((msg) => (
//             <div 
//               key={msg.id}
//               className="list-group-item list-group-item-action py-3"
//               onClick={() => setSelectedMsg(msg)}
//               style={{ cursor: 'pointer' }}
//             >
//               <div className="d-flex w-100 justify-content-between">
//                 <h6 className="mb-1 text-truncate" style={{ maxWidth: '70%' }}>
//                   {msg.subject || '(No Subject)'}
//                 </h6>
//                 <small className="text-muted">{formatDate(msg.createdAt)}</small>
//               </div>
//               <p className="mb-0 text-truncate text-muted">
//                 From: {msg.from?.address || msg.from || 'Unknown sender'}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {selectedMsg && (
//         <div className="modal show d-block" tabIndex="-1" onClick={() => setSelectedMsg(null)}>
//           <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" 
//                onClick={(e) => e.stopPropagation()}>
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">{selectedMsg.subject || '(No Subject)'}</h5>
//                 <button 
//                   type="button" 
//                   className="btn-close" 
//                   onClick={() => setSelectedMsg(null)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <div className="mb-4">
//                   <p><strong>From:</strong> {selectedMsg.from?.address || selectedMsg.from || 'Unknown'}</p>
//                   <p><strong>To:</strong> {selectedMsg.to?.[0]?.address || selectedMsg.to || 'Unknown'}</p>
//                   <p><strong>Date:</strong> {formatDate(selectedMsg.createdAt)}</p>
//                 </div>
                
//                 <div className="border-top pt-3">
//                   {loadingContent ? (
//                     <div className="text-center py-4">
//                       <div className="spinner-border text-primary" role="status">
//                         <span className="visually-hidden">Loading...</span>
//                       </div>
//                       <p>Loading message content...</p>
//                     </div>
//                   ) : messageContent?.html ? (
//                     <div dangerouslySetInnerHTML={{ __html: messageContent.html }} />
//                   ) : (
//                     <pre className="email-content">
//                       {messageContent?.text || 'No message content'}
//                     </pre>
//                   )}
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button 
//                   className="btn btn-secondary" 
//                   onClick={() => setSelectedMsg(null)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// final code
// src/components/Inbox.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function Inbox({ messages }) {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [messageContent, setMessageContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (selectedMsg) {
      setLoadingContent(true);
      axios
        .get(`${API_BASE}/inbox/content/${selectedMsg.token}/${selectedMsg.id}`)
        .then((res) => setMessageContent(res.data))
        .catch((err) => {
          setMessageContent({
            text: 'Failed to load content: ' + err.message,
            html: '<p>Failed to load content</p>',
          });
        })
        .finally(() => setLoadingContent(false));
    }
  }, [selectedMsg]);

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  if (!messages.length) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <h5 className="text-muted">Your inbox is empty</h5>
          <p className="text-muted">Emails will appear here automatically</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Inbox ({messages.length})</h5>
        </div>
        <div className="list-group list-group-flush">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="list-group-item list-group-item-action py-3"
              onClick={() => setSelectedMsg(msg)}
              style={{ cursor: 'pointer' }}
            >
              {/* Custom message-item layout */}
              <div className="message-item d-flex align-items-center">
                <div className="message-icon me-3 d-flex justify-content-center align-items-center bg-primary text-white rounded-circle" style={{ width: 40, height: 40 }}>
                  {msg.from?.address ? msg.from.address[0].toUpperCase() : '?'}
                </div>
                <div className="message-content flex-grow-1">
                  <div className="message-subject fw-bold text-truncate">
                    {msg.subject || '(No Subject)'}
                  </div>
                  <div className="message-preview text-muted small">
                    From: {msg.from?.address || msg.from || 'Unknown sender'}
                  </div>
                  <div className="message-meta text-muted small">
                    {formatDate(msg.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMsg && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          onClick={() => setSelectedMsg(null)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedMsg.subject || '(No Subject)'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedMsg(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-4">
                  <p>
                    <strong>From:</strong>{' '}
                    {selectedMsg.from?.address || selectedMsg.from || 'Unknown'}
                  </p>
                  <p>
                    <strong>To:</strong>{' '}
                    {selectedMsg.to?.[0]?.address ||
                      selectedMsg.to ||
                      'Unknown'}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(selectedMsg.createdAt)}
                  </p>
                </div>

                <div className="border-top pt-3">
                  {loadingContent ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p>Loading message content...</p>
                    </div>
                  ) : messageContent?.html ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: messageContent.html }}
                    />
                  ) : (
                    <pre className="email-content">
                      {messageContent?.text || 'No message content'}
                    </pre>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedMsg(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
