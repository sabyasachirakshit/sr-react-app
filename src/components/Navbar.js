import React, { useState } from "react";
import styled from "styled-components";
import { MenuOutlined } from "@ant-design/icons";

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #001f3f;
  padding: 10px 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: row;
  }
`;

const NavBrand = styled.div`
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
  cursor: pointer;
`;

const Hamburger = styled(MenuOutlined)`
  display: none;
  font-size: 24px;
  color: white;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const NavItems = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 768px) {
    position: absolute;
    top: 50px;
    right: 20px;
    background-color: #001f3f;
    flex-direction: column;
    width: auto;
    align-items: flex-start;
    display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }
`;

const NavItem = styled.div`
  color: white;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 5px;
  transition: background-color 0.3s, color 0.3s;

  &:hover {
    background-color: #1890ff;
    color: white;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: left;
    padding: 10px;
  }
`;

const Navbar = ({ onNavClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNavItemClick = (section) => {
    setIsOpen(false); // Close the dropdown menu when a navigation item is clicked
    onNavClick(section); // Trigger the navigation callback
  };

  return (
    <Nav>
      <NavBrand onClick={() => onNavClick("home")}>TaskFlow</NavBrand>
      <Hamburger onClick={handleToggle} />
      <NavItems isOpen={isOpen}>
        <NavItem onClick={() => handleNavItemClick("todo")}>Todo</NavItem>
        <NavItem onClick={() => handleNavItemClick("chat")}>Chat</NavItem>
        <NavItem onClick={() => handleNavItemClick("settings")}>Settings</NavItem>
      </NavItems>
    </Nav>
  );
};

export default Navbar;
