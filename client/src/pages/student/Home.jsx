import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";

import GuestHome from "../../components/student/GuestHome";
import LoggedInHome from "../../components/student/LoggedInHome";

const Home = () => {
  const { userData } = useContext(AppContext);

  return userData ? <LoggedInHome /> : <GuestHome />;
};

export default Home;