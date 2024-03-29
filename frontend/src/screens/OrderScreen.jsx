import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { 
    useGetOrderDetailsQuery, 
    usePayOrderMutation, 
    useGetPayPalClientIdQuery,
    useDeliverOrderMutation,
} from '../slices/ordersApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'

const OrderScreen = () => {
    const { id: orderId } = useParams();
    const { 
        data: order, 
        refetch, 
        isLoading, 
        error 
    } = useGetOrderDetailsQuery(orderId);

    const [payOrder, { isLoading: isPayOrderLoading }] = usePayOrderMutation();

    const [deliverOrder, { isDeliverOrderLoading }] = useDeliverOrderMutation();

    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
    
    const { data: paypal, isLoading: isPayPalLoading, error: errorPayPal } = useGetPayPalClientIdQuery();

    const { userInfo } = useSelector(state => state.auth);

    useEffect(() => {
        if (!errorPayPal && !isPayPalLoading && paypal.clientId) {
            const loadPayPalScript = async () => {
                paypalDispatch({
                    type: 'resetOptions',
                    value: {
                        'client-id': paypal.clientId,
                        'currency': 'USD',
                    }
                });
                paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
            }
            if (order && !order.isPaid) {
                if (!window.paypal) {
                    loadPayPalScript();
                }
            }
        }
    }, [order, paypal, paypalDispatch, isPayPalLoading, errorPayPal]);

    const onApprove = (data, actions) => {
        return actions.order.capture().then(async details => {
            try {
                await payOrder({ orderId, details });
                refetch();
                toast.success('Payment successful');
            } catch (err) {
                toast.error(err?.data?.message || err.message);
            }
        })
    }

    const onApproveTest = async () => {
        await payOrder({ orderId, details: { payer: {} } });
        refetch();
        toast.success('Payment successful');
    }

    const onError = (err) => {
        toast.error(err.message);
    }

    const createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: order.totalPrice,
                    }
                }
            ]
        }).then(orderId => orderId);
    }

    const deliverOrderHandler = async () => {
        try {
            await deliverOrder(orderId);
            refetch();
            toast.success('Order delivered');
        } catch (err) {
            toast.error(err?.data.message || err.message);
        }
    }

    return isLoading ? <Loader/> : error ? <Message variant='danger'/> 
    : (
        <>
            <h1>Order {order._id}</h1>
            <Row>
                <Col md={8}>
                    <ListGroup>
                        <ListGroup.Item>
                            <h2>Shipping</h2>
                            <p>
                                <strong>Name: </strong> {order.user.name}
                            </p>
                            <p>
                                <strong>Email: </strong> {order.user.email}
                            </p>
                            <p>
                                <strong>Address: </strong> {order.shippingAddress.address},  {order.shippingAddress.city}  {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                            </p>
                            <p>
                                {order.isDelivered ? (
                                    <Message variant='success'>Delivered on {order.deliveredAt}</Message>
                                ) : (
                                    <Message variant='danger'>Not Delivered</Message>
                                )}
                            </p>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <h2>Payment Method</h2>
                            <p>
                                <strong>Method: </strong>
                                {order.paymentMethod}
                            </p>
                            {order.isPaid ? (
                                <Message variant='success'>Paid on {order.paidAt}</Message>
                            ) : (
                                <Message variant='danger'>Not Paid</Message>
                            )}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <h2>Order Items</h2>
                            { order.orderItems.map((item, index) => (
                                <ListGroup.Item>
                                    <Row>
                                        <Col md={1}>
                                            <Image src={item.image} alt={item.name} fluid rounded></Image>
                                        </Col>
                                        <Col>
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                        </Col>
                                        <Col md={4}>
                                            {item.qty} x ${item.price} = ${item.qty * item.price}
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            )) }
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
                                    <Col>${order.itemsPrice}</Col>
                                </Row>
                                <Row>
                                    <Col>Shipping</Col>
                                    <Col>${order.shippingPrice}</Col>
                                </Row>
                                <Row>
                                    <Col>Tax</Col>
                                    <Col>${order.taxPrice}</Col>
                                </Row>
                                <Row>
                                    <Col>Total</Col>
                                    <Col>${order.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            { !order.isPaid && (
                                <ListGroup.Item>
                                    { isPayOrderLoading  && <Loader/>}
                                    { isPending ? <Loader/> : (
                                        <div>
                                            <Button onClick={onApproveTest} style={{marginBottom: '8px'}}>
                                                Test Pay Order
                                            </Button>
                                            <div>
                                                <PayPalButtons
                                                    createOrder={createOrder}
                                                    onApprove={onApprove}
                                                    onError={onError}
                                                ></PayPalButtons>
                                            </div>
                                        </div>
                                    ) }
                                </ListGroup.Item>
                            ) }
                            { isDeliverOrderLoading && <Loader/> }
                            { userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                                <ListGroup.Item>
                                    <Button type='button' className='btn btn-block' onClick={deliverOrderHandler}>
                                        Mark As Delivered
                                    </Button>
                                </ListGroup.Item>
                            ) }
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default OrderScreen;
