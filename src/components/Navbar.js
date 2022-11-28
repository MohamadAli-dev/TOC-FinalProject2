import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import './css/Navbar.css'

const Navbarh = props => {
    return (
        <>
            <Navbar className='navBar'>
                <Container className='container'>
                    <Navbar.Brand href="/" className='nav-brand'>
                        Theory of Computation
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="/" className='text-danger'>Deterministic Acyclic Finite State Automaton (DAFSA)</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        </>
    );
}

export default Navbarh;