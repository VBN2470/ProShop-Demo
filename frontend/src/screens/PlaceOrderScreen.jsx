import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Row, Col, ListGroup, Image, Card  } from 'react-bootstrap';
import CheckoutSteps from '../components/CheckoutSteps';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice';

const PlaceOrderScreen = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { 
        cartItems,
        shippingAddress,
        paymentMethod, 
        itemsPrice, 
        shippingPrice, 
        taxPrice, 
        totalPrice 
    } = useSelector(state => state.cart);


    const [createOrder, { isLoading, error }] = useCreateOrderMutation();

    const placeOrderHandler = async () => {
        try {
            const res = await createOrder({
                orderItems: cartItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
            }).unwrap();
            dispatch(clearCartItems());
            navigate(`/order/${res._id}`);
        } catch (error) {
            toast.error(error);
        }
    }

    useEffect(() => {
        if (!shippingAddress.address) {
            navigate('/shipping');
        } else if (!paymentMethod) {
            navigate('/payment');
        }
    }, [shippingAddress.address, paymentMethod, navigate])

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
            <ListGroup variant='flush'>
                <ListGroup.Item>
                    <h2>Shipping</h2>
                    <p>
                        <strong>Address:</strong> {shippingAddress.address}, {shippingAddress.city} {shippingAddress.postalCode}, {shippingAddress.country}
                    </p>
                </ListGroup.Item>
                <ListGroup.Item>
                    <h2>Payment Method</h2>
                    <p>
                        <strong>Method:</strong> {paymentMethod}
                    </p>
                </ListGroup.Item>
                <ListGroup.Item>
                    <h2>Order Items</h2>
                    {cartItems.length === 0 ? (
                        <Message>Your cart is empty</Message>
                    ): (
                        <ListGroup variant='flush'>
                            {cartItems.map((item, index) => (
                                <ListGroup.Item key={index}>
                                    <Row>
                                        <Col md={1}>
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fluid
                                                rounded
                                            />
                                        </Col>
                                        <Col>
                                            <Link to={`/product/${item._id}`}>
                                                {item.name}
                                            </Link>
                                        </Col>
                                        <Col md={4}>
                                            { item.qty } x ${ item.price } = ${ item.qty * item.price }
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </ListGroup.Item>
            </ListGroup>
        </Col>
        <Col md={4}>
            <Card>
                <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <h2>Order Summary</h2>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Items</Col>
                            <Col>
                                ${itemsPrice}
                            </Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Shipping</Col>
                            <Col>
                                ${shippingPrice}
                            </Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Tax</Col>
                            <Col>
                                ${taxPrice}
                            </Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Total</Col>
                            <Col>
                                ${totalPrice}
                            </Col>
                        </Row>
                    </ListGroup.Item>

                    <ListGroup.Item>
                        { error && <Message variant='danger'>{error}</Message> }
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <Button 
                            type='button' 
                            className='btn-block'
                            disabled={cartItems.length === 0}
                            onClick={placeOrderHandler}
                        >
                            Place Order
                        </Button>
                        { isLoading && <Loader/>}
                    </ListGroup.Item>
                </ListGroup>
            </Card>
        </Col>
      </Row>
    </>
  )
}

export default PlaceOrderScreen;
