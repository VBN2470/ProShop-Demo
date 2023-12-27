import { Badge, Nav, Navbar, Container } from 'react-bootstrap';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import logo from '../assets/logo.png';

import React from 'react'
import { useSelector } from 'react-redux';

const Header = () => {
    const { cartItems }  = useSelector(state => state.cart);
    console.log(cartItems);
    return (
        <header>
            <Navbar bg='dark' variant='dark' expand='lg' collapseOnSelect>
                <Container>
                    <LinkContainer to='/'>
                        <Navbar.Brand>
                            <img src={logo} alt="ProShop" />
                            ProShop
                        </Navbar.Brand>
                    </LinkContainer>
                    <Navbar.Toggle aria-controls='basic-navbar-nav'></Navbar.Toggle>
                    <Navbar.Collapse id='basic-navbar-nav'>
                        <Nav className='ms-auto'>
                            <LinkContainer to='/cart'>
                                <Nav.Link>
                                    <FaShoppingCart/> Cart 
                                    {cartItems.length > 0 && (
                                        <Badge pill bg='info' style={{ marginLeft: '0.5rem' }}>
                                            { cartItems.reduce((acc, cur) => acc + cur.qty, 0) }
                                        </Badge>
                                    )}
                                </Nav.Link>
                            </LinkContainer>
                            <LinkContainer to='/login'>
                                <Nav.Link><FaUser/> Sign In </Nav.Link>
                            </LinkContainer>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    )
}

export default Header;
