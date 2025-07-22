export interface Column {
  label: string;
  key: string;
  tag?: string;
}

export interface CommonDataTableProps {
  columns: Column[];
  data: Array<Record<string, any>>;
  renderActions: (row: any) => React.ReactNode;
  pageSize: number;
  isPagination: boolean;
  totalCount: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}
