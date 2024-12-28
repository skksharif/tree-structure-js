import React, { useState } from "react";
import "./App.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchIcon from "@mui/icons-material/Search";
import employeeData from "./data.json";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import ScoreIcon from "@mui/icons-material/Score";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import StarOutlineIcon from "@mui/icons-material/StarOutline";

const data = {
  employees: employeeData.employees,
};
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
    node.department.toLowerCase() === departmentFilter.toLowerCase() ||
    node.department.toLowerCase() === "executive";

  const isGradeMatch =
    gradeFilter === "All" || getGrade(node.metrics.rating) === gradeFilter;

  const filteredReports =
    node.reports
      ?.map((report) =>
        searchTree(report, searchTerm, departmentFilter, gradeFilter)
      )
      .filter((child) => child) || [];

  const isMatch = isNameMatch && isDepartmentMatch && isGradeMatch;

  return isMatch || filteredReports.length > 0
    ? {
        ...node,
        isHighlighted: searchTerm ? isNameMatch : false,
        isExactMatch: searchTerm && isMatch,
        reports: filteredReports,
      }
    : null;
};
const TreeNode = ({ node, isRoot, searchTerm }) => {
  const [isExpandedByUser, setIsExpandedByUser] = useState(null);

  const toggleExpand = () => {
    setIsExpandedByUser((prev) => (prev === null ? !isRoot : !prev));
  };
  const isExpanded =
    isExpandedByUser !== null
      ? isExpandedByUser
      : isRoot || node.isExactMatch || node.isHighlighted || searchTerm !== "";

  return (
    <li>
      <div className={`card ${node.isExactMatch ? "exact-match" : ""}`}>
        <img src={node.image} alt={node.name} />
        <div>
          <p>
            <strong>{node.name}</strong>
          </p>
          <p className="position">
            {node.position} - {node.department}
          </p>
          <div className="metrics">
            <p>
              <TrackChangesIcon />
              {node.metrics.target_achievement}
            </p>
            <p>
              <ScoreIcon />
              {node.metrics.engagement_score}
            </p>
            <p>
              <CompareArrowsIcon />
              {node.metrics.rating}
            </p>
            <p>
              <StarOutlineIcon />
              {node.metrics.feedback}
            </p>
          </div>
        </div>
        {node.reports && node.reports.length > 0 && (
          <button
            id="expand"
            className={isExpanded ? "expanded" : ""}
            onClick={toggleExpand}
          >
            {node.reports.length}
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </button>
        )}
      </div>
      {isExpanded && node.reports && (
        <ul>
          {node.reports
            .sort((a, b) => b.isExactMatch - a.isExactMatch)
            .map((child, index) => (
              <TreeNode
                key={index}
                node={child}
                isRoot={false}
                searchTerm={searchTerm}
              />
            ))}
        </ul>
      )}
    </li>
  );
};
export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [scale, setScale] = useState(1);

  const filteredData = data.employees
    .map((employee) =>
      searchTree(employee, searchTerm, departmentFilter, gradeFilter)
    )
    .filter((employee) => employee);

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("All");
    setGradeFilter("All");
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
            <button onClick={clearFilters} id="clear-button">
              Clear Filters
            </button>
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
                <TreeNode
                  key={index}
                  node={employee}
                  isRoot={true}
                  searchTerm={searchTerm}
                />
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
