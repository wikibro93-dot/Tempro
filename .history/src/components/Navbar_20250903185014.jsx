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