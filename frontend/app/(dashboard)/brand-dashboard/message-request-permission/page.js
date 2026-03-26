"use client";
import RequestChatInterface from "./RequestChatInterface";

function RequestChatInterfacePage() {
  // These handlers will connect to your backend API
  const handleAcceptRequest = (request) => {
    console.log("Accepting request from:", request);
    // TODO: Call your backend API to accept the chat request
    // Example: api.acceptChatRequest(request.email)
  };

  const handleRejectRequest = (request) => {
    console.log("Rejecting request from:", request);
    // TODO: Call your backend API to reject the chat request
    // Example: api.rejectChatRequest(request.email)
  };

  const handleSearchContacts = (searchTerm) => {
    console.log("Searching contacts:", searchTerm);
    // TODO: Call your backend API to search contacts
    // Example: api.searchContacts(searchTerm)
  };

  const handleSelectContact = (contact) => {
    console.log("Selected contact:", contact);
    // TODO: Open chat with selected contact
    // Example: navigate to chat with contact.id
  };

  return (
    <div className="App">
      <RequestChatInterface
        // Pass your backend data as props
        // currentUser={userData}
        // contacts={contactsData}
        // chatRequest={pendingRequest}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onSearchContacts={handleSearchContacts}
        onSelectContact={handleSelectContact}
      />
    </div>
  );
}

export default RequestChatInterfacePage;
