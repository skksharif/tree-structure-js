import React, { useState } from "react";
import "./App.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import employeeData from "./data.json";

const data = {
  employees: employeeData.employees,
};

// Define grade ranges based on ratings
const getGrade = (rating) => {
  if (rating >= 4.0) return "A";
  if (rating >= 3.0) return "B";
  if (rating >= 2.0) return "C";
  return "D";
};

const searchTree = (node, searchTerm, departmentFilter, gradeFilter) => {
  const isNameMatch =
    !searchTerm || node.name.toLowerCase().includes(searchTerm.toLowerCase());

  const isDepartmentMatch =
    departmentFilter === "All" ||
    node.department === departmentFilter ||
    node.department === "Executive";

  const isGradeMatch =
    gradeFilter === "All" || getGrade(node.metrics.rating) === gradeFilter;

  const filteredReports =
    node.reports
      ?.map((report) =>
        searchTree(report, searchTerm, departmentFilter, gradeFilter)
      )
      .filter((child) => child) || [];

  // A node is included if it matches or if any of its children match
  const isMatch = isNameMatch && isDepartmentMatch && isGradeMatch;
  return isMatch || filteredReports.length > 0
    ? {
        ...node,
        isHighlighted: isNameMatch,
        isExactMatch: isMatch,
        reports: filteredReports,
      }
    : null;
};


const TreeNode = ({ node, isRoot }) => {
  const [isExpandedByUser, setIsExpandedByUser] = useState(null); // Null means not toggled by user

  const toggleExpand = () => {
    setIsExpandedByUser((prev) => (prev === null ? !isRoot : !prev));
  };

  // Determine if the node should be expanded
  const isExpanded =
    isExpandedByUser !== null
      ? isExpandedByUser
      : isRoot || node.isExactMatch || node.isHighlighted;

  return (
    <li>
      <div
        className={`card ${
          node.isExactMatch
            ? "exact-match" // Highlight exact matches with green
            : node.isHighlighted
            ? "highlight" // Highlight name matches with yellow
            : ""
        }`}
      >
        <img src={node.image} alt={node.name} />
        <div>
          <p>
            <strong>{node.name}</strong>
          </p>
          <p className="position">
            {node.position} - {node.department}
          </p>
          <div className="metrics">
            <p>{node.metrics.target_achievement}</p>
            <p>{node.metrics.engagement_score}</p>
            <p>{node.metrics.rating}</p>
            <p>{node.metrics.feedback}</p>
          </div>
        </div>
        {node.reports && node.reports.length > 0 && (
          <button id="expand" onClick={toggleExpand}>
            {node.reports.length}
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </button>
        )}
      </div>
      {isExpanded && node.reports && (
        <ul>
          {node.reports
            .sort((a, b) => b.isExactMatch - a.isExactMatch) // Show exact matches first
            .map((child, index) => (
              <TreeNode key={index} node={child} isRoot={false} />
            ))}
        </ul>
      )}
    </li>
  );
};



export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All"); // New state for grades
  const [scale, setScale] = useState(0.6); // Scale state for zooming

  const filteredData = data.employees
    .map((employee) =>
      searchTree(employee, searchTerm, departmentFilter, gradeFilter)
    )
    .filter((employee) => employee);

  // Zoom in function
  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2)); // Max zoom is 200%
  };

  // Zoom out function
  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Min zoom is 50%
  };

  return (
    <>
      <div className="container">
        <header>
          <div className="headerSearch">
            <input
              type="text"
              name="search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button id="search-icon">
              <SearchIcon />
            </button>
          </div>
          <div style={{ display: "flex" }}>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All Departments</option>
              <option value="Executive">Executive</option>
              <option value="Marketing">Marketing</option>
              <option value="Design">Design</option>
              <option value="Sales">Sales</option>
              <option value="Development">Development</option>
              <option value="Operations">Operations</option>
            </select>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
            >
              <option value="All">All Grades</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="D">Grade D</option>
            </select>
          </div>
        </header>
        <div className="tree">
          {filteredData.length === 0 ? (
            <p>No results found</p>
          ) : (
            <ul
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              {filteredData.map((employee, index) => (
                <TreeNode key={index} node={employee} isRoot={true} />
              ))}
            </ul>
          )}
        </div>
        <div className="zoom-buttons">
          <div className="inner-zoom-buttons">
            <button onClick={zoomOut}>-</button>
            <span>{(scale * 100).toFixed(0)}%</span>
            <button onClick={zoomIn}>+</button>
          </div>
        </div>
      </div>
    </>
  );
}
