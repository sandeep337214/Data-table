import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import axios from "axios";

import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ArtworkTable = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  const [rowSelectionCount, setRowSelectionCount] = useState(0);
  const [showInputNumber, setShowInputNumber] = useState(false);

  const initialLoadRef = useRef(true); 

  const updateSelectionsessionStorage = (updatedSelections: number[]) => {
    const currentSelections = sessionStorage.getItem("selectedRows")
      ? JSON.parse(sessionStorage.getItem("selectedRows")!)
      : {};
    currentSelections[page] = updatedSelections;
    sessionStorage.setItem("selectedRows", JSON.stringify(currentSelections));
  };

  // Fetch artworks for the current page
  const fetchArtworks = async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${currentPage}`
      );
      const { data, pagination } = response.data;
      setArtworks(data);
      setTotalRecords(pagination.total);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
    
  };

  // Handle page changes
  const onPageChange = (event: any) => {
    const currentPage = event.page + 1;
    setPage(currentPage);
  };

  const onRowSelectionChange = (e: any) => {
    const selected = e.value;
    setSelectedRows(selected);
    updateSelectionsessionStorage(selected.map((row: Artwork) => row.id));
  };

  const handleRowCountChange = (e: any) => {
    setRowSelectionCount(e.value || 0);
  };

  // Submit button logic
  const handleRowCountSubmit = () => {
    const count = rowSelectionCount;
    const selected = artworks.slice(0, count);
    setSelectedRows(selected);
    updateSelectionsessionStorage(selected.map((row) => row.id));
    setShowInputNumber(false); // Close the dropdown after submission
  };

  useEffect(() => {
    if (initialLoadRef.current) {
      fetchArtworks(1);
      initialLoadRef.current = false;
    } else {
      fetchArtworks(page);
    }
  }, [page]);

  const selectionTemplate = () => {
    return (
      <div className="relative">
        <Button
          icon="pi pi-chevron-down"
          className="p-button-rounded p-button-text"
          onClick={() => setShowInputNumber((prev) => !prev)}
        />
        {showInputNumber && (
          <div
            className="absolute top-full left-0 z-10 bg-white border border-gray-300 p-2 rounded-lg flex flex-col gap-2 w-40"
          >
            <InputNumber
              value={rowSelectionCount}
              onChange={handleRowCountChange}
              placeholder="Input number"
              className="w-full"
            />
            <Button
              label="Submit"
              icon="pi pi-check"
              className="p-button-sm p-button-success"
              onClick={handleRowCountSubmit}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 w-full h-full">
      <h3 className="text-2xl font-semibold mb-4">Artwork Table</h3>
      <DataTable
        value={artworks}
        lazy
        paginator
        rows={10}
        totalRecords={totalRecords}
        loading={loading}
        onPage={onPageChange}
        dataKey="id"
        selection={selectedRows}
        onSelectionChange={onRowSelectionChange}
        className="w-full"
        selectionMode="multiple" // This enables the checkboxes for row selection
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3em" }}
          header={selectionTemplate()}
        ></Column>
        <Column field="title" header="Title" className="text-lg" />
        <Column field="place_of_origin" header="Place of Origin" className="text-lg" />
        <Column field="artist_display" header="Artist Display" className="text-lg" />
        <Column field="inscriptions" header="Inscriptions" className="text-lg" />
        <Column field="date_start" header="Date Start" className="text-lg" />
        <Column field="date_end" header="Date End" className="text-lg" />
      </DataTable>
    </div>
  );
};

export default ArtworkTable;
