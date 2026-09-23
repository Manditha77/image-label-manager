import Modal from "./Modal";

export default function ConfirmModal({ title, message, yesText = "Yes", noText = "No", onYes, onNo }) {
  return (
    <Modal
      title={title}
      onClose={onNo}
      footer={
        <>
          <button className="btn" onClick={onNo}>
            {noText}
          </button>
          <button className="btn btn-primary" onClick={onYes} autoFocus>
            {yesText}
          </button>
        </>
      }
    >
      {message}
    </Modal>
  );
}
