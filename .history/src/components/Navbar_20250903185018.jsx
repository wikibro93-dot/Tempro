// import React from "react";

// const Navbar = ({ emailDuration, setDuration, isNavExpanded, setIsNavExpanded }) => {
//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 rounded">
//       <div className="container-fluid">
//         <span className="navbar-brand me-3">New Email Duration:</span>
//         <button 
//           className="navbar-toggler" 
//           type="button" 
//           onClick={() => setIsNavExpanded(!isNavExpanded)}
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className={`collapse navbar-collapse ${isNavExpanded ? 'show' : ''}`}>
//           <div className="d-flex flex-column flex-md-row gap-2">
//             <button 
//               className={`btn ${emailDuration === "10min" ? "btn-primary" : "btn-outline-primary"}`}
//               onClick={() => setDuration("10min")}
//             >
//               10 min
//             </button>
//             <button 
//               className={`btn ${emailDuration === "1hour" ? "btn-primary" : "btn-outline-primary"}`}
//               onClick={() => setDuration("1hour")}
//             >
//               1 hour
//             </button>
//             <button 
//               className={`btn ${emailDuration === "24hour" ? "btn-primary" : "btn-outline-primary"}`}
//               onClick={() => setDuration("24hour")}
//             >
//               24 hours
//             </button>
//             <button 
//               className={`btn ${emailDuration === "max" ? "btn-primary" : "btn-outline-primary"}`}
//               onClick={() => setDuration("max")}
//             >
//               Max Time
//             </button>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;



import React from "react";
import { Menu, X, Clock } from "lucide-react"; // modern icons

const Navbar = ({ emailDuration, setDuration, isNavExpanded, setIsNavExpanded }) => {
  const options = [
    { label: "10 min", value: "10min" },
    { label: "1 hour", value: "1hour" },
    { label: "24 hours", value: "24hour" },
    { label: "Max Time", value: "max" },
  ];

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md shadow-md rounded-2xl p-3 mb-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Branding */}
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-800">New Email Duration</span>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-600 hover:text-gray-900"
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          aria-label="Toggle navigation"
        >
          {isNavExpanded ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Nav Options */}
        <div
          className={`${
            isNavExpanded ? "flex" : "hidden"
          } md:flex flex-col md:flex-row gap-2 mt-4 md:mt-0 transition-all duration-300`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDuration(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  emailDuration === opt.value
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
