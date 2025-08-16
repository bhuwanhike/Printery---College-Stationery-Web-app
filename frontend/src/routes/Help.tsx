import { useEffect, useState } from "react";
import PrinteryButton from "../components/PrinteryButton";
import { useUser } from "../context/useUser";
const Help = () => {
  const { admissionNo } = useUser();
  const [formData, setFormData] = useState({
    admissionNo: "",
    email: "",
    query: "",
  });
  useEffect(() => {
    if (admissionNo) {
      setFormData((prev) => ({ ...prev, admissionNo }));
    }
  }, [admissionNo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you can send the form data to your backend
  };

  return (
    <div className="mx-auto w-full h-full ">
      <div className="bg-[#0b112d] rounded-2xl p-8 w-[50%]   shadow-lg border border-[#1b254b] mx-auto my-30 px-20">
        <h1 className="text-2xl font-bold text-white mb-10 text-center">
          Help & Support
        </h1>
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Admission No */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Admission No
            </label>
            <input
              type="text"
              name="admissionNo"
              value={formData.admissionNo}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#0f1f47] border border-[#1b254b] text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter your admission number"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-[#0f1f47] border border-[#1b254b] text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Query */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Query
            </label>
            <textarea
              name="query"
              value={formData.query}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-[#0f1f47] border border-[#1b254b] text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Describe your issue or question..."
              required
            ></textarea>
          </div>

          {/* Submit */}
          <div className="w-[30%] mx-auto mt-10">
            <PrinteryButton innerText="Submit Query" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Help;
