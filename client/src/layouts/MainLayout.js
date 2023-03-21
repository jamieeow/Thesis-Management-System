import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Row from 'react-bootstrap/Row';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { Search } from 'react-bootstrap-icons';
import { AsyncTypeahead, Highlighter, Menu, MenuItem } from 'react-bootstrap-typeahead';
import { useTranslation } from 'react-i18next';
import { LinkContainer } from 'react-router-bootstrap';
import { Outlet, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import ProfileImage from '../components/ProfileImage';
import NotificationContext from '../contexts/NotificationContext';
import { useAccount } from '../providers/account';
import AuthService from '../services/AuthService';
import SearchService from '../services/SearchService';

function MainLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { account } = useAccount();
  const [selected, setSelected] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toastTimer, setToastTimer] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/auth/login');
  };

  const handleSearch = async (q) => {
    q = q.trim();
    if (q.length < 2) return;

    setLoading(true);
    const options = await SearchService.search(q);
    setOptions(options);
    setLoading(false);
  };

  const handleOption = (option) => {
    navigate(`/thesis/${option._id}`);
    setSelected([]);
  };

  const handleSearchKey = (e) => {
    if (e.isComposing || e.keyCode === 229) return;

    if (e.keyCode === 13) {
      if (selected.length > 0) {
        const option = selected[0];
        handleOption(option);
      }
    }
  };

  const renderSearchMenu = (
    results,
    {
      newSelectionPrefix,
      paginationText,
      renderMenuItemChildren,
      ...menuProps
    },
    state
  ) => {
    if (!results || results.length === 0) {
      return (
        <Menu {...menuProps}>
          <Menu.Header>Test</Menu.Header>
          <MenuItem position={0}>
            ABC
          </MenuItem>
        </Menu>
      );
    }

    let index = 0;
    const items = results.map(e => {
      if (e.type === 'thesis') {
        const thesis = e.value;
        const item = (
          <MenuItem key={thesis._id} option={thesis} position={index}>
            <Highlighter search={state.name}>{thesis.title}</Highlighter>
            <div>
              <small>{thesis.authors.map(e => t('values.full_name', e)).join('; ')}</small>
            </div>
          </MenuItem>
        );
  
        index += 1;
        return item;
      } else {
        return <></>;
      }
    });
    return <Menu {...menuProps}>{items}</Menu>
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setToastTimer(Date.now());
      setNotifications(prev => {
        const time = Date.now();
        return prev.filter(e => !e.delay || e.timestamp + e.delay >= time);
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const pushNotification = notification => {
    setNotifications(prev => {
      const { category, title, message, delay } = notification;
      const next = [...prev];
      const timestamp = Date.now();
      const obj = { id: timestamp, timestamp, category, title, message, delay: delay !== undefined ? delay : 5000 };
      next.push(obj);
      return next;
    });
  };

  const removeNotification = notificationID => {
    setNotifications(prev => {
      return prev.filter(e => e.id !== notificationID);
    });
  };

  const sidebar = kind => {
    switch (kind) {
      case 'administrator':
        return [
          { name: 'Home', path: '/' },
          { name: 'Defense', path: '/defense' },
          { name: 'Announcements', path: '/announcement' },
          { name: 'Thesis Projects', path: '/thesis' },
          { name: 'Accounts', path: '/account' }
        ];
      case 'faculty':
        return [
          { name: 'Home', path: '/' },
          { name: 'Defense', path: '/defense' },
          { name: 'Thesis Projects', path: '/thesis' }
        ];
      case 'student':
      default:
        return [
          { name: 'Home', path: '/' },
          { name: 'Defense', path: '/defense' },
          { name: 'My Thesis', path: '/thesis' }
        ];
    }
  }

  return (
    <>
      <Offcanvas
        show={showSearch}
        onHide={() => setShowSearch(false)}
        placement='top'
        style={{
          height: '128px'
        }}
      >
        <Container>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Search</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Form className="d-flex ms-auto w-100">
              <AsyncTypeahead
                id='formSearch'
                className="mx-2 w-100"
                filterBy={() => true}
                isLoading={loading}
                labelKey='title'
                renderMenu={renderSearchMenu}
                onSearch={handleSearch}
                options={options}
                aria-label="Search"
                placeholder="Search..."
                selected={selected}
                onChange={setSelected}
                onKeyDown={handleSearchKey}
                selectHint={false}
              />
              <Button variant="outline-success">Search</Button>
            </Form>
          </Offcanvas.Body>
        </Container>
      </Offcanvas>
      <NotificationContext.Provider value={{ notifications, pushNotification }}>
        <ToastContainer id={`toast-${toastTimer}`} className='position-fixed bottom-0 end-0 mb-4 me-4' style={{ zIndex: 11 }}>
          {
            notifications.map(e => (
              <Toast onClose={() => removeNotification(e.id)} animation>
                <Toast.Header>
                  <strong className='me-auto'>{e.title}</strong>
                  <small>{dayjs(e.id).fromNow()}</small>
                </Toast.Header>
                <Toast.Body>{e.message}</Toast.Body>
              </Toast>
            ))
          }
        </ToastContainer>
        <Navbar bg="light" expand="lg">
          <Container>
            <LinkContainer to='/'>
              <Navbar.Brand>AnimoPlan</Navbar.Brand>
            </LinkContainer>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end w-100">
              <Nav className="ms-3">
                <Button className='me-2' variant='link' onClick={() => setShowSearch(true)}><Search /></Button>
                <Dropdown align="end" as={NavItem} id="account-dropdown">
                  <Dropdown.Toggle as={NavLink}>
                    <ProfileImage
                      roundedCircle
                      thumbnail
                      className='me-1'
                      accountID={account.accountID}
                      width={30}
                    />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <ProfileImage
                      roundedCircle
                      className='mx-5 my-3'
                      accountID={account.accountID}
                      width={120}
                    />
                    <div className='text-center'>{t('values.full_name_regular', account)}</div>
                    <div className='text-center text-muted'>{t(`values.account_kind.${account.kind}`)} account</div>
                    <NavDropdown.Divider />
                    <LinkContainer to='/settings'>
                      <NavDropdown.Item>Settings</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>Sign out</NavDropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Container>
          <Row className='bg-white'>
            <Col sm={3} md={2} className='pt-3 pb-5 px-5' style={{ backgroundColor: '#f8f8f8' }}>
              <Nav variant='pills' className='flex-column'>
                {
                  sidebar(account.kind).map(e => (
                    <LinkContainer to={e.path}>
                      <Nav.Link eventKey={e.path}>{e.name}</Nav.Link>
                    </LinkContainer>
                  ))
                }
              </Nav>
            </Col>
            <Col sm={9} md={10} className='pt-3 pb-5'>
              <Outlet />
            </Col>
          </Row>
        </Container>
      </NotificationContext.Provider>
    </>
  );
}

export default MainLayout;
