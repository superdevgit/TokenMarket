import React, { createContext, lazy, Suspense, useState } from "react";
import { Route, Routes } from "react-router-dom";
import contents from "./Routes";
import TableHeader from "../../components/table/TableHeader";

export const DbValues = createContext<{
  dbValues: { tables: string[]; formValues: any };
  setdbValues: React.Dispatch<React.SetStateAction<any>>;
  sourceConnected: boolean;
  setSourceConnected: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  sourceConnected: false,
  dbValues: { tables: [""], formValues: {} },
  setdbValues: () => { },
  setSourceConnected: () => { },
});

const PAGE_404 = lazy(() => import("../Page404"));
const ContentRoutes = () => {
  const [dbValues, setdbValues] = useState({ tables: [""], formValues: {} });
  const [sourceConnected, setSourceConnected] = useState(false);

  return (
    <main>
      <Suspense fallback={<div>Loading....</div>}>
        <DbValues.Provider
          value={{ dbValues, setdbValues, sourceConnected, setSourceConnected }}
        >

          <Routes>
            {contents.map((page) => {
              // eslint-disable-next-line react/jsx-props-no-spreading
              return <Route key={page.path} {...page} />;
            })}
            <Route path="*" element={<PAGE_404 />} />
          </Routes>
        </DbValues.Provider>
      </Suspense>
    </main>
  );
};

export default ContentRoutes;
