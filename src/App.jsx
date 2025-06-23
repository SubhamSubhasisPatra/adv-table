import React, { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { RowGroupingModule } from "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "./App.css";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule, RowGroupingModule]);

// Hardcoded car data - 10 entries with additional numeric fields
const carData = [
  {
    id: 1,
    make: "Toyota",
    brand: "Toyota",
    model: "Camry",
    year: 2020,
    country: "Japan",
    price: 25000,
    mileage: 35000,
    rating: 4.5,
  },
  {
    id: 2,
    make: "Honda",
    brand: "Honda",
    model: "Civic",
    year: 2021,
    country: "Japan",
    price: 22000,
    mileage: 28000,
    rating: 4.3,
  },
  {
    id: 3,
    make: "Ford",
    brand: "Ford",
    model: "Mustang",
    year: 2022,
    country: "USA",
    price: 35000,
    mileage: 15000,
    rating: 4.7,
  },
  {
    id: 4,
    make: "BMW",
    brand: "BMW",
    model: "X5",
    year: 2023,
    country: "Germany",
    price: 55000,
    mileage: 8000,
    rating: 4.8,
  },
  {
    id: 5,
    make: "Mercedes",
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2020,
    country: "Germany",
    price: 45000,
    mileage: 42000,
    rating: 4.6,
  },
  {
    id: 6,
    make: "Audi",
    brand: "Audi",
    model: "A4",
    year: 2021,
    country: "Germany",
    price: 40000,
    mileage: 32000,
    rating: 4.4,
  },
  {
    id: 7,
    make: "Toyota",
    brand: "Toyota",
    model: "RAV4",
    year: 2022,
    country: "Japan",
    price: 30000,
    mileage: 20000,
    rating: 4.2,
  },
  {
    id: 8,
    make: "Honda",
    brand: "Honda",
    model: "Accord",
    year: 2023,
    country: "Japan",
    price: 28000,
    mileage: 12000,
    rating: 4.4,
  },
  {
    id: 9,
    make: "Ford",
    brand: "Ford",
    model: "F-150",
    year: 2021,
    country: "USA",
    price: 40000,
    mileage: 45000,
    rating: 4.1,
  },
  {
    id: 10,
    make: "BMW",
    brand: "BMW",
    model: "3 Series",
    year: 2020,
    country: "Germany",
    price: 42000,
    mileage: 38000,
    rating: 4.5,
  },
];

// Custom aggregation functions for group headers
const customAggFunctions = {
  // Average with formatting
  avgPrice: (params) => {
    if (params.values.length === 0) return null;
    const sum = params.values.reduce((a, b) => a + b, 0);
    const avg = sum / params.values.length;
    return `Avg: $${Math.round(avg).toLocaleString()}`;
  },

  // Min/Max range
  priceRange: (params) => {
    if (params.values.length === 0) return null;
    const min = Math.min(...params.values);
    const max = Math.max(...params.values);
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  },

  // Count with percentage
  countWithPercent: (params) => {
    const totalRows = params.api.getDisplayedRowCount();
    const percentage = ((params.values.length / totalRows) * 100).toFixed(1);
    return `${params.values.length} cars (${percentage}%)`;
  },

  // Sum with average in parentheses
  sumWithAvg: (params) => {
    if (params.values.length === 0) return null;
    const sum = params.values.reduce((a, b) => a + b, 0);
    const avg = sum / params.values.length;
    return `Total: ${Math.round(sum).toLocaleString()} (Avg: ${Math.round(avg).toLocaleString()})`;
  },

  // Average rating with star display
  avgRating: (params) => {
    if (params.values.length === 0) return null;
    const sum = params.values.reduce((a, b) => a + b, 0);
    const avg = sum / params.values.length;
    const stars = "★".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg));
    return `${avg.toFixed(1)} ${stars}`;
  },

  // Custom year range
  yearRange: (params) => {
    if (params.values.length === 0) return null;
    const min = Math.min(...params.values);
    const max = Math.max(...params.values);
    return min === max ? `${min}` : `${min} - ${max}`;
  },
};

const App = () => {
  const [rowData, setRowData] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [groupedColumns, setGroupedColumns] = useState([]);
  const [dragOverArea, setDragOverArea] = useState(false);

  // Column definitions with aggregation enabled
  const columnDefs = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      pinned: "left",
    },
    {
      field: "make",
      headerName: "Make",
      width: 120,
      enableRowGroup: true,
      enableValue: true,
      aggFunc: "countWithPercent",
    },
    {
      field: "brand",
      headerName: "Brand",
      width: 150,
      enableRowGroup: true,
    },
    {
      field: "model",
      headerName: "Model",
      width: 140,
      enableRowGroup: true,
    },
    {
      field: "year",
      headerName: "Year",
      width: 100,
      enableRowGroup: true,
      enableValue: true,
      aggFunc: "yearRange",
      type: "numericColumn",
    },
    {
      field: "country",
      headerName: "Country",
      width: 120,
      enableRowGroup: true,
    },
    {
      field: "price",
      headerName: "Price",
      width: 130,
      type: "numericColumn",
      valueFormatter: (params) => {
        if (!params.data)
          return Math.min(
            ...params.node.allLeafChildren.map((d) => d.data.price),
          );
        return "$" + params.value?.toLocaleString();
      },
      enableValue: true,
      aggFunc: "avgPrice",
      cellStyle: (params) => {
        if (params.value > 40000)
          return { color: "#e74c3c", fontWeight: "bold" };
        if (params.value > 25000) return { color: "#f39c12" };
        return { color: "#27ae60" };
      },
    },
    {
      field: "mileage",
      headerName: "Mileage",
      width: 120,
      type: "numericColumn",
      valueFormatter: (params) => {
        if (!params.data)
          return Math.min(
            ...params.node.allLeafChildren.map((d) => d.data.mileage),
          );
        return params.value?.toLocaleString() + " mi";
      },
      enableValue: true,
      aggFunc: "sumWithAvg",
      cellStyle: (params) => {
        if (params.value > 30000) return { color: "#e74c3c" };
        if (params.value > 20000) return { color: "#f39c12" };
        return { color: "#27ae60" };
      },
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 130,
      type: "numericColumn",
      valueFormatter: (params) => {
        // Check if it's a group row
        if (params.node && params.node.group) {
          // For group rows, return the already formatted aggregated value
          return params.value;
        }
        // For regular rows, format the rating
        return params.value?.toFixed(1) + " ⭐";
      },
      enableValue: true,
      aggFunc: "avgRating",
      cellStyle: (params) => {
        // Only apply styling to leaf (data) rows, not group rows
        if (params.node && params.node.group) {
          return { fontWeight: "bold", fontStyle: "italic" };
        }

        if (params.value >= 4.5)
          return { color: "#27ae60", fontWeight: "bold" };
        if (params.value >= 4.0) return { color: "#f39c12" };
        return { color: "#e74c3c" };
      },
    },
  ];

  // Default column settings
  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    enableRowGroup: false,
    enableValue: false,
    // Enable column dragging
    suppressMovable: false,
  };

  // Auto group column with custom renderer for enhanced display
  const autoGroupColumnDef = {
    headerName: "Car Groups",
    minWidth: 300,
    cellRendererParams: {
      suppressCount: false,
      checkbox: false,
      innerRenderer: (params) => {
        if (params.node.group) {
          const count = params.node.allChildrenCount;
          const level = params.node.level;
          const indent = "  ".repeat(level);
          const icon = params.node.expanded ? "📂" : "📁";
          return `${indent}${icon} ${params.node.key} (${count} cars)`;
        }
        return params.value;
      },
    },
    headerTooltip: "Grouped data with expandable rows and aggregated values",
  };

  // Handle drag over the drop area
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOverArea(true);
  };

  // Handle drag leave the drop area
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverArea(false);
  };

  // Handle drop in the drop area
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOverArea(false);

    try {
      // Get the column field from the drag data
      const columnField = e.dataTransfer.getData("text/plain");

      console.log("Dropped column field:", columnField); // Debug log

      if (columnField && !groupedColumns.includes(columnField)) {
        // Check if the column supports row grouping
        const columnDef = columnDefs.find((col) => col.field === columnField);
        if (
          columnDef &&
          (columnDef.enableRowGroup ||
            columnField === "make" ||
            columnField === "country" ||
            columnField === "brand" ||
            columnField === "model" ||
            columnField === "year")
        ) {
          const newGroupedColumns = [...groupedColumns, columnField];
          setGroupedColumns(newGroupedColumns);

          // Update the grid grouping
          if (gridApi) {
            gridApi.setRowGroupColumns(newGroupedColumns);
          }
        } else {
          console.log("Column does not support grouping:", columnField);
        }
      } else if (groupedColumns.includes(columnField)) {
        console.log("Column already grouped:", columnField);
      }
    } catch (error) {
      console.log("Drop error:", error);
    }
  };

  // Remove a column from grouping
  const removeGroupColumn = (columnField) => {
    const newGroupedColumns = groupedColumns.filter(
      (col) => col !== columnField,
    );
    setGroupedColumns(newGroupedColumns);

    if (gridApi) {
      gridApi.setRowGroupColumns(newGroupedColumns);
    }
  };

  // Get display name for column
  const getColumnDisplayName = (field) => {
    const columnDef = columnDefs.find((col) => col.field === field);
    return columnDef ? columnDef.headerName : field;
  };

  // Grid options with custom aggregation functions
  const gridOptions = {
    animateRows: true,
    groupDefaultExpanded: 0,
    groupIncludeFooter: true,
    groupIncludeTotalFooter: true,
    suppressAggFuncInHeader: true,
    enableRangeSelection: true,
    functionsReadOnly: false,
    aggFuncs: customAggFunctions,
    groupRowRenderer: "agGroupCellRenderer",
    groupRowRendererParams: {
      footerValueGetter: (params) => {
        const count = params.node.allChildrenCount;
        return `Total: ${count} vehicles`;
      },
    },
    onColumnRowGroupChanged: (params) => {
      // Sync state when grouping changes through ag-Grid's built-in functionality
      const currentGroupColumns = params.columnApi
        .getRowGroupColumns()
        .map((col) => col.getColId());
      setGroupedColumns(currentGroupColumns);
    },
    // Enable column drag for our custom drop area

    getGroupRowAgg: (groupKeys, rowGroupColumns, children) => {
      // Custom logic for group row aggregation
      const result = {};

      if (!rowGroupColumns || !children) return;

      // Calculate custom aggregations for each column
      rowGroupColumns.forEach((col) => {
        const field = col.getColDef().field;
        const values = children
          .map((child) => child.data[field])
          .filter((val) => val != null);

        if (values.length > 0) {
          switch (field) {
            case "price":
              result[field] = values.reduce((a, b) => a + b, 0) / values.length;
              break;
            case "mileage":
              result[field] = values.reduce((a, b) => a + b, 0);
              break;
            case "rating":
              result[field] = values.reduce((a, b) => a + b, 0) / values.length;
              break;
            case "year":
              result[field] =
                Math.max(...values) - Math.min(...values) > 0
                  ? `${Math.min(...values)}-${Math.max(...values)}`
                  : Math.min(...values);
              break;
            default:
              result[field] = values[0];
          }
        }
      });

      return result;
    },
  };

  // Load data when component mounts
  useEffect(() => {
    setRowData(carData);
  }, []);

  // Grid ready callback
  const onGridReady = (params) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();

    // Add custom drag listeners to column headers
    setTimeout(() => {
      const columnHeaders = document.querySelectorAll(
        ".ag-header-cell[col-id]",
      );
      columnHeaders.forEach((header) => {
        const colId = header.getAttribute("col-id");

        // Check if this column is groupable
        const isGroupable = [
          "make",
          "brand",
          "model",
          "year",
          "country",
        ].includes(colId);

        if (isGroupable) {
          header.style.cursor = "grab";
          header.draggable = true;

          header.addEventListener("dragstart", (e) => {
            header.style.cursor = "grabbing";
            e.dataTransfer.setData("text/plain", colId);
            e.dataTransfer.effectAllowed = "copy";
            console.log("Column drag started:", colId);
          });

          header.addEventListener("dragend", (e) => {
            header.style.cursor = "grab";
            console.log("Column drag ended:", colId);
          });
        }
      });
    }, 100);
  };

  // Clear all groups (updated to sync with state)
  const clearGroups = () => {
    setGroupedColumns([]);
    if (gridApi) {
      gridApi.setRowGroupColumns([]);
    }
  };

  // Updated group functions to sync with state
  const groupByMake = () => {
    const columns = ["make"];
    setGroupedColumns(columns);
    if (gridApi) {
      gridApi.setRowGroupColumns(columns);
    }
  };

  const groupByCountry = () => {
    const columns = ["country"];
    setGroupedColumns(columns);
    if (gridApi) {
      gridApi.setRowGroupColumns(columns);
    }
  };

  const groupByCountryMake = () => {
    const columns = ["country", "make"];
    setGroupedColumns(columns);
    if (gridApi) {
      gridApi.setRowGroupColumns(columns);
    }
  };

  // Expand all groups
  const expandAll = () => {
    if (gridApi) {
      gridApi.expandAll();
    }
  };

  // Collapse all groups
  const collapseAll = () => {
    if (gridApi) {
      gridApi.collapseAll();
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <h1>Car Inventory - Enhanced Grouping with Drag & Drop</h1>
        <p>
          Drag columns from the table to the drop area below to group
          dynamically
        </p>
      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={clearGroups} className="btn btn-danger">
          Clear Groups
        </button>
        <button onClick={groupByMake} className="btn btn-primary">
          Group by Make
        </button>
        <button onClick={groupByCountry} className="btn btn-success">
          Group by Country
        </button>
        <button onClick={groupByCountryMake} className="btn btn-info">
          Group by Country → Make
        </button>
        <button onClick={expandAll} className="btn btn-secondary">
          Expand All
        </button>
        <button onClick={collapseAll} className="btn btn-secondary">
          Collapse All
        </button>
      </div>

      {/* Custom Drag & Drop Area */}
      <div className="custom-drop-area-container">
        <div
          className={`custom-drop-area ${dragOverArea ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOverArea(true);
          }}
        >
          <div className="drop-area-header">
            <span className="drop-icon">🎯</span>
            <span className="drop-title">Drop Columns Here to Group</span>
          </div>

          {groupedColumns.length === 0 ? (
            <div className="drop-area-empty">
              <p>
                Drag column headers from the table below to create dynamic
                groups
              </p>
              <p className="drop-hint">
                💡 Click and drag any column header (Country, Make, Brand,
                Model, Year)
              </p>
              <p className="drop-hint">
                🖱️ You can also use the buttons above for quick grouping
              </p>
            </div>
          ) : (
            <div className="grouped-columns">
              <div className="grouped-columns-label">Active Groups:</div>
              <div className="grouped-columns-list">
                {groupedColumns.map((columnField, index) => (
                  <div key={columnField} className="grouped-column-item">
                    <span className="group-order">{index + 1}</span>
                    <span className="group-name">
                      {getColumnDisplayName(columnField)}
                    </span>
                    <button
                      className="remove-group-btn"
                      onClick={() => removeGroupColumn(columnField)}
                      title={`Remove ${getColumnDisplayName(columnField)} from grouping`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="grid-container ag-theme-alpine">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          gridOptions={gridOptions}
          onGridReady={onGridReady}
          // Grouping settings
          rowGroupPanelShow="never" // Hide the built-in panel since we have our custom one
          allowDragFromColumnsToolPanel={true}
          groupDefaultExpanded={0}
          groupIncludeFooter={true}
          groupIncludeTotalFooter={true}
          suppressAggFuncInHeader={true}
          // Additional settings
          animateRows={true}
          rowSelection="multiple"
          groupSelectsChildren={true}
          enableRangeSelection={true}
          enableCharts={false}
          maintainColumnOrder={true}
          suppressDragLeaveHidesColumns={true}
          // Disable row dragging and enable column operations
          suppressRowDrag={true}
          suppressDragLeaveHidesColumns={true}
        />
      </div>
    </div>
  );
};

export default App;
