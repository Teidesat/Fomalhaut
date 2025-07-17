import React from "react";
import "./CommandForm.css";

const CommandForm: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Command sent (simulated)");
  };

  return (
    <form onSubmit={handleSubmit} className="command-form">
      <div>
        <label htmlFor="commandType">Command Type</label>
        <select id="commandType" name="commandType">
          <option value="reset">Reset</option>
          <option value="update">Update</option>
          <option value="diagnostic">Diagnostic</option>
        </select>
      </div>

      <div>
        <label htmlFor="key">Key</label>
        <input type="text" id="key" name="key" placeholder="e.g. EPS_RESET" />
      </div>

      <div>
        <label htmlFor="body">Body</label>
        <textarea
          id="body"
          name="body"
          rows={3}
          placeholder="Command parameters"
        />
      </div>

      <button type="submit">Send Command</button>
    </form>
  );
};

export default CommandForm;
