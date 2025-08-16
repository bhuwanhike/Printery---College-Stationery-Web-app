const PrinteryButton = ({ innerText }: { innerText: string }) => {
  return (
    <div>
      <button
        type="submit"
        className="w-full py-2 bg-gradient-to-r from-purple-900 via-blue-600 to-blue-800  text-white rounded-lg font-medium hover:opacity-90"
      >
        {innerText}
      </button>
    </div>
  );
};

export default PrinteryButton;
