import { lazy } from "react";

const APP = {
  TOKEN_LISTING: lazy(() => import("../TokenListing")),
  RECENT_TRADES: lazy(() => import("../RecentTrades")),
  MY_ORDERS: lazy(() => import("../MyOrders")),
  ADMIN: lazy(() => import("../Admin")),
};

const routes = [
  {
    path: "/",
    element: <APP.TOKEN_LISTING />,
    exact: true,
  },
  {
    path: "/recent-trades",
    element: <APP.RECENT_TRADES />,
    exact: true,
  },
  {
    path: "/my-orders",
    element: <APP.MY_ORDERS />,
    exact: true,
  },
  {
    path: "/admin",
    element: <APP.ADMIN />,
    exact: true,
  },
];

export default routes;
