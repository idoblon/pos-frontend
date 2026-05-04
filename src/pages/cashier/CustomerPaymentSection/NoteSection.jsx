import React from "react";
import { FileText } from "lucide-react";

const NoteSection = ({ note, onNoteChange }) => {
  return (
    <div className="rs">
      <div className="rs-title">
        <FileText size={13} />
        Note
      </div>
      <textarea
        className="note-ta"
        rows={2}
        placeholder="Enter note..."
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
      />
    </div>
  );
};

export default NoteSection;
