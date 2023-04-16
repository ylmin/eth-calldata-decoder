import React from "react";
import ReactDOM from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./components/Body/index";
import Safe from "./components/Safe/index";
import Navbar from "./components/Navbar";


ReactDOM.render(


  <ChakraProvider theme={theme}>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<>
          <Navbar />
          <Home />
        </>} />
        <Route path="home" element={<>
          <Navbar />
          <Home />
        </>} />
        <Route path="safe" element={<>
          <Navbar />
          <Safe />
        </>} />
      </Routes>
    </BrowserRouter>
  </ChakraProvider>,
  document.getElementById("root")
);
