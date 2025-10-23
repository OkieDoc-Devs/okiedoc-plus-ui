import React, { useState, useMemo, useEffect, useRef } from 'react';
import './ChatOversight.css';
import MaleAvatar from '../../assets/Male_Avatar.png';
import FemaleAvatar from '../../assets/Female_Avatar.png';

const dummyTickets = [
  {
    id: 'TKT-001',
    patientName: 'Christina Wung',
    participants: ['Christina Wung', 'Nurse Tyler', 'Dr. Christina'],
    lastMessage: 'I will ask some supporting details',
    timestamp: '13:12 PM',
    status: 'Active',
    patientAvatar: FemaleAvatar,
  },
  {
    id: 'TKT-002',
    patientName: 'John Doe',
    participants: ['John Doe', 'Nurse Sarah', 'Dr. Smith'],
    lastMessage: 'Thank you, Doctor.',
    timestamp: '11:45 AM',
    status: 'Active',
    patientAvatar: MaleAvatar,
  },
  {
    id: 'TKT-003',
    patientName: 'Alex Johnson',
    participants: ['Alex Johnson', 'Nurse Tyler'],
    lastMessage: 'Okay, I will wait.',
    timestamp: 'Yesterday',
    status: 'Pending Transfer',
    patientAvatar: MaleAvatar,
  },
];

const dummyMessages = {
  'TKT-001': [
    { id: 'msg1', senderId: 'nurse-tyler', senderName: 'Nurse Tyler', avatar: MaleAvatar, text: 'Hi, there! Just want to confirm the level of pain', timestamp: '13:12 PM' },
    { id: 'msg2', senderId: 'patient-christina', senderName: 'Christina Wung', avatar: FemaleAvatar, text: 'Hi, there! I’m in deep pain. Let’s say 8/10!', timestamp: '13:12 PM' },
    { id: 'msg3', senderId: 'nurse-tyler', senderName: 'Nurse Tyler', avatar: MaleAvatar, text: 'Alright, I’ll transfer you to our Doctor', timestamp: '13:12 PM' },
    { id: 'msg4', senderId: 'system', text: 'Nurse Tyler transferred you to Dr. Christina\nPlease wait 5-10 mins\nDr. Christina is in the chat now', timestamp: '' },
    { id: 'msg5', senderId: 'dr-christina', senderName: 'Dr. Christina', avatar: FemaleAvatar, text: 'Hi, there! This is Dr. Christina', timestamp: '13:12 PM' },
    { id: 'msg6', senderId: 'patient-christina', senderName: 'Christina Wung', avatar: FemaleAvatar, text: 'Hi, there! I’m in deep pain right now.', timestamp: '13:12 PM' },
    { id: 'msg7', senderId: 'dr-christina', senderName: 'Dr. Christina', avatar: FemaleAvatar, text: 'I will ask some supporting details', timestamp: '13:12 PM' },
  ],
  'TKT-002': [
    { id: 'msg8', senderId: 'nurse-sarah', senderName: 'Nurse Sarah', avatar: FemaleAvatar, text: 'Hello John, I see you booked a consultation for a persistent cough.', timestamp: '11:30 AM' },
    { id: 'msg9', senderId: 'patient-john', senderName: 'John Doe', avatar: MaleAvatar, text: 'Yes, it\'s been bothering me for a week.', timestamp: '11:31 AM' },
    { id: 'msg10', senderId: 'system', text: 'Nurse Sarah transferred you to Dr. Smith', timestamp: '' },
    { id: 'msg11', senderId: 'dr-smith', senderName: 'Dr. Smith', avatar: MaleAvatar, text: 'Hello Mr. Doe. I am Dr. Smith. Please describe your cough.', timestamp: '11:35 AM' },
    { id: 'msg12', senderId: 'patient-john', senderName: 'John Doe', avatar: MaleAvatar, text: 'It\'s a dry cough, and I sometimes feel short of breath.', timestamp: '11:36 AM' },
    { id: 'msg13', senderId: 'dr-smith', senderName: 'Dr. Smith', avatar: MaleAvatar, text: 'Understood. I am writing you a prescription for a mild cough suppressant and an inhaler.', timestamp: '11:44 AM' },
    { id: 'msg14', senderId: 'patient-john', senderName: 'John Doe', avatar: MaleAvatar, text: 'Thank you, Doctor.', timestamp: '11:45 AM' },
  ],
  'TKT-003': [
    { id: 'msg15', senderId: 'nurse-tyler', senderName: 'Nurse Tyler', avatar: MaleAvatar, text: 'Hi Alex, Nurse Tyler here. I see your request for a follow-up.', timestamp: 'Yesterday' },
    { id: 'msg16', senderId: 'patient-alex', senderName: 'Alex Johnson', avatar: MaleAvatar, text: 'Hi, yes. My symptoms are still present.', timestamp: 'Yesterday' },
    { id: 'msg17', senderId: 'nurse-tyler', senderName: 'Nurse Tyler', avatar: MaleAvatar, text: 'Okay, I will find a doctor to assist you. Please hold on.', timestamp: 'Yesterday' },
    { id: 'msg18', senderId: 'patient-alex', senderName: 'Alex Johnson', avatar: MaleAvatar, text: 'Okay, I will wait.', timestamp: 'Yesterday' },
  ],
};


const ChatOversight = () => {
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState({});
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const chatBodyRef = useRef(null);

  useEffect(() => {
    setTickets(dummyTickets);
    setMessages(dummyMessages);
    if (dummyTickets.length > 0) {
      setSelectedTicketId(dummyTickets[0].id);
    }
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [selectedTicketId, messages]);

  const selectedTicket = useMemo(() => {
    return tickets.find(t => t.id === selectedTicketId);
  }, [selectedTicketId, tickets]);

  const selectedMessages = useMemo(() => {
    return messages[selectedTicketId] || [];
  }, [selectedTicketId, messages]);

  const filteredTickets = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (!lowerSearchTerm) return tickets;
    return tickets.filter(ticket =>
      ticket.patientName.toLowerCase().includes(lowerSearchTerm) ||
      ticket.participants.some(p => p.toLowerCase().includes(lowerSearchTerm))
    );
  }, [tickets, searchTerm]);

  const isSameSenderAsPrevious = (currentMsg, index) => {
    if (index === 0) return false;
    const previousMsg = selectedMessages[index - 1];
    if (previousMsg.senderId === 'system' || currentMsg.senderId === 'system') return false;
    return previousMsg.senderId === currentMsg.senderId;
  };

  return (
    <div id="chat-consultations"> 
      <h2>Chat Consultations</h2>
      <div className="chat-oversight-container">
        <div className="chat-ticket-list">
          <div className="chat-search-bar">
            <input
              type="text"
              placeholder="Search by patient or staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="chat-ticket-scroll">
            {filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                className={`ticket-list-item ${ticket.id === selectedTicketId ? 'active' : ''}`}
                onClick={() => setSelectedTicketId(ticket.id)}
              >
                <img src={ticket.patientAvatar} alt="avatar" className="ticket-avatar" />
                <div className="ticket-info">
                  <div className="ticket-info-header">
                    <span className="ticket-patient-name">{ticket.patientName}</span>
                    <span className="ticket-timestamp">{ticket.timestamp}</span>
                  </div>
                  <p className="ticket-last-message">{ticket.lastMessage}</p>
                </div>
              </div>
            ))}
             {filteredTickets.length === 0 && (
                <div className="chat-list-empty">No tickets match search.</div>
            )}
          </div>
        </div>

        <div className="chat-view-panel">
          {selectedTicket ? (
            <>
              <div className="chat-view-header">
                <h3>{selectedTicket.patientName}</h3>
                <span className="chat-participants">
                  with: {selectedTicket.participants.slice(1).join(', ')}
                </span>
              </div>
              <div className="chat-view-body" ref={chatBodyRef}>
                {selectedMessages.map((msg, index) => {
                  const showAvatar = !isSameSenderAsPrevious(msg, index) && msg.senderId !== 'system';
                  const senderType = msg.senderId.startsWith('patient') ? 'patient' : (msg.senderId === 'system' ? 'system' : 'staff');

                  if (senderType === 'system') {
                    return (
                      <div key={msg.id} className="message-row system">
                        <div className="system-message">
                          {msg.text.split('\n').map((line, i) => (
                            <span key={i}>{line}</span>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`message-row ${senderType}`}>
                      {showAvatar && (
                        <img src={msg.avatar} alt={msg.senderName} className="message-avatar" />
                      )}
                      {!showAvatar && (
                        <div className="avatar-spacer"></div>
                      )}
                      <div className="message-bubble-container">
                        <div className={`message-bubble ${senderType}`}>
                          <p className="message-text">{msg.text}</p>
                        </div>
                        <span className="message-timestamp">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="chat-view-footer-readonly">
                <span>Chat Oversight Mode (Read-Only)</span>
              </div>
            </>
          ) : (
            <div className="chat-view-empty">
              <p>Select a ticket to view the consultation chat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatOversight;