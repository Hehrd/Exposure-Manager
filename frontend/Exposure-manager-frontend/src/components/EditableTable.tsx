import { useEffect, useRef, useContext } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ThemeContext } from "../context/ThemeContext";
import "tabulator-tables/dist/css/tabulator.min.css";
import "../styles/EditableTable.css";

const EditableTable = () => {
  const { theme } = useContext(ThemeContext);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const tableInstance = useRef<any>(null);

  const data = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    role: ["Developer", "Designer", "Manager"][i % 3],
    age: 20 + (i % 10),
    bio:
      i === 4
        ? "This is an extremely long biography meant to test whether the bio column can wrap instead of expanding. It should not cause the table to stretch beyond the screen width. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum in lacus at erat sagittis commodo nec nec justo."
        : "Short bio",
  }));

  useEffect(() => {
    if (tableInstance.current) {
      tableInstance.current.destroy();
    }

    if (tableRef.current) {
      tableInstance.current = new Tabulator(tableRef.current, {
        data,
        layout: "fitData",
        height: "500px",
        reactiveData: true,
        responsiveLayout: false,
        columns: [
          { title: "ID", field: "id", width: 60, editor: false },
          { title: "Name", field: "name", editor: "input", width: 150 },
          { title: "Role", field: "role", editor: "input", width: 150 },
          { title: "Age", field: "age", editor: "number", width: 80 },
          {
            title: "Bio",
            field: "bio",
            editor: "textarea",
            formatter: "textarea",
            minWidth: 150,
            maxWidth: 600,
            widthGrow: 3,
            editorParams: {
              elementAttributes: {
                style: `
                  width: 100%;
                  display: block;
                  resize: vertical;
                  box-sizing: border-box;
                  font-family: 'Segoe UI', sans-serif;
                  font-size: 0.95rem;
                  font-weight: normal;
                  line-height: 1.5;
                  letter-spacing: normal;
                  white-space: pre-wrap;
                  word-break: break-word;
                  padding: 4px;
                  margin: 0;
                  border: none;
                  outline: none;
                  background-color: var(--bg-color);
                  color: var(--text-color);
                  vertical-align: top;
                `,
              },
            },
          },
        ],
      });

      tableInstance.current.on("cellEditing", (cell: any) => {
        const input = cell.getElement().querySelector("textarea") as HTMLTextAreaElement | null;
        if (!input) return;

        const cellElement = cell.getElement();
        const computed = getComputedStyle(input);
        const paddingTop = parseFloat(computed.paddingTop || "0");
        const paddingBottom = parseFloat(computed.paddingBottom || "0");

        const exactHeight = Math.floor(cellElement.clientHeight - paddingTop - paddingBottom);
        input.style.height = `${exactHeight}px`;

        const resizeHandler = () => {
          input.style.height = "auto";
          input.style.height = input.scrollHeight + "px";
        };

        input.addEventListener("input", resizeHandler);

        tableInstance.current?.on("cellEdited", () => {
          input?.removeEventListener("input", resizeHandler);
        });
      });
    }
  }, [theme]);

  const handleSave = () => {
    const updatedData = tableInstance.current?.getData();
    console.log("Saving data:", updatedData);
  };

  return (
    <div className="table-container">
      <h2 className="table-heading">Editable Team Table</h2>
      <div ref={tableRef} />
      <button className="save-button" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
};

export default EditableTable;
