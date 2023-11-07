import axios from 'axios';
import { useEffect, useState } from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity, Modal, ToastAndroid } from 'react-native';
import Globals from '../components/Globals';
import { Button, Card } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';
import Spinner from 'react-native-loading-spinner-overlay';
import moment from 'moment/moment';

const Favourite = ({ navigation }) => {
    const businessGroupId = "1";
    lang = 0;
    lat = 0;
    const wishListUrl = `${Globals.API_URL}/MembersWishLists/GetMemberWishListByMemberID`;
    const userEarnedRewardsAPI = Globals.API_URL + `/RewardConfigs/GetRewardConfigBusinessGroupwiseMemberwise/${businessGroupId}`;
    const [wishList, setWishList] = useState([]);
    const [promotionClaimData, setPromotionClaimData] = useState([]);
    const [autoPilotClaimData, setAutoPilotClaimData] = useState([]);
    const [businessClaimData, setbusinessClaimData] = useState([]);
    const [formattedDate, setFormattedDate] = useState([]);
    const logoPath = wishList[0] ? wishList[0].logoPath : null;
    const logoUrl = Globals.Root_URL + `${logoPath}`;
    const [MemberData, setMemberData] = useState([{}]);
    const [loading, setLoading] = useState(false);
    const [earnerRewards, setEarnedRevards] = useState([]);
    const isFocused = useIsFocused();
    const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
    const [isAutoPilotModalVisible, setIsAutoPilotModalVisible] = useState(false);

    async function setLangandLat(latitude, longitude) {
        lang = longitude;
        lat = latitude;
    }

    memberID = 0;
    async function setEarnedRevardsData(value) {
        setEarnedRevards(value);
    }

    async function setWishListData(value) {
        setWishList(value);
    }

    const setIsPromoModalVisibleData = async (promotion, businessdata) => {
        setIsPromoModalVisible(true);
        setPromotionClaimData(promotion);
        setbusinessClaimData(businessdata);
    }
    const setIsAPModalVisibleData = async (autopilot, businessdata) => {
        setIsAutoPilotModalVisible(true);
        setAutoPilotClaimData(autopilot);
        setbusinessClaimData(businessdata);
    }

    const openPromoModal = async (promotion, item) => {
        setLoading(true)
        await setIsPromoModalVisibleData(promotion, item);
        setLoading(false)
    }
    const openAPModal = async (autopilot, item) => {
        setLoading(true)
        await setIsAPModalVisibleData(autopilot, item);
        setLoading(false)
    }

    const closePromoModal = () => {
        setLoading(true);
        setIsPromoModalVisible(false);
        setLoading(false);
    }
    const closeAPModal = () => {
        setLoading(true);
        setIsAutoPilotModalVisible(false);
        setLoading(false);
    }

    const closePromoRedeemModal = async (type, ID) => {
        setLoading(true)
        await axios({
            method: 'GET',
            url: `${Globals.API_URL}/Promotions/GetRewardsByActivityTypeAndIDInMobile/${type}/${ID}`
        }).then(async (response) => {
            ToastAndroid.showWithGravityAndOffset(
                'Claimed Successfully!',
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50,
            );
            // setWishList([]);
            await getRefreshData();
            setIsPromoModalVisible(false);
            // setLoading(false)
        }).catch(error => {
            console.error('Error retrieving dataa:', error);
            setLoading(false);
        });
        // setLoading(false)
    }
    const closeAutoPilotRedeemModal = async (type, ID) => {
        setLoading(true)
        await axios({
            method: 'GET',
            url: `${Globals.API_URL}/Promotions/GetRewardsByActivityTypeAndIDInMobile/${type}/${ID}`
        }).then(async (response) => {
            ToastAndroid.showWithGravityAndOffset(
                'Claimed Successfully!',
                ToastAndroid.LONG,
                ToastAndroid.BOTTOM,
                25,
                50,
            );
            // setWishList([]);
            await getRefreshData();

            setIsAutoPilotModalVisible(false);
            // setLoading(false)
        }).catch(error => {
            console.error('Error retrieving dataa:', error);
            setLoading(false);
        });
        // setLoading(false)
    }

    async function setMemData(value) {
        await setMemberData(value);
    }

    const getRefreshData = () => {
        console.log('dfghbgjdnfjknb')
        AsyncStorage.getItem('token')
            .then(async (value) => {
                setLoading(true);
                if (value !== null) {
                    await setMemData(JSON.parse(value));
                    memberID = (JSON.parse(value))[0].memberId;
                    await axios({
                        method: 'GET',
                        url: `${wishListUrl}/${memberID}`
                    }).then(async (response) => {
                        console.log('response---', response.data)
                        await Geolocation.getCurrentPosition(
                            async position => {
                                const { latitude, longitude } = position.coords;

                                await setLangandLat(latitude, longitude);
                                // You can now use the latitude and longitude in your app

                                await response.data.map((data1, index) => {

                                    const toRadian = n => (n * Math.PI) / 180
                                    let lat2 = data1.latitude
                                    let lon2 = data1.longitude
                                    let lat1 = lat
                                    let lon1 = lang

                                    let R = 6371  // km
                                    let x1 = lat2 - lat1
                                    let dLat = toRadian(x1)
                                    let x2 = lon2 - lon1
                                    let dLon = toRadian(x2)
                                    let a =
                                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                        Math.cos(toRadian(lat1)) * Math.cos(toRadian(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
                                    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                                    let d = R * c

                                    data1.distance = parseInt(d * 0.621371);
                                })
                                await setWishListData(response.data);
                                setLoading(false)
                            },
                            error => {
                                console.error('Error getting current location: ', error);
                            },
                            { enableHighAccuracy: false, timeout: 5000 }
                        );
                    });
                    memberID = (JSON.parse(value))[0].memberId;
                }
            })
            .catch(error => {
                console.error('Error retrieving dataa:', error);
                setLoading(false);
            });
    }
    useEffect(() => {
        getRefreshData();
    }, [isFocused]);

    return (
        <View style={styles.container} >
            <View style={[styles.suncontainer, isPromoModalVisible ? { backgroundColor: 'rgba(0,0,0,0.5)', opacity: 0.4 } : '', isAutoPilotModalVisible ? { backgroundColor: 'rgba(0,0,0,0.5)', opacity: 0.4 } : '']}>
                <View style={{ flexDirection: 'row', width: '97%', height: '10%', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.welcomeText}>Favourite</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('NotificationTray')}>
                        <Image source={require('../assets/notification-skD.png')} style={styles.setimg1} />
                    </TouchableOpacity>
                </View>

                <SafeAreaView style={styles.scrollContainer}>
                    <ScrollView style={{ flex: 1, height: '100%', width: '97%', borderRadius: 50 }}>
                        <View style={styles.wishlistView}>
                            {wishList && wishList.map((item, index) => (
                                <View key={index} style={[styles.listView, isPromoModalVisible ? { opacity: 0.4 } : '', isAutoPilotModalVisible ? { opacity: 0.4 } : '']}>
                                    <Image source={{ uri: logoUrl }} style={styles.logoBusiness} />
                                    <Image source={require('../assets/heart-dNh.png')} style={styles.likeHeart} />
                                    <Text style={styles.totalLikes}> 1.5K Likes </Text>
                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={styles.businessName}>{item.businessName}</Text>
                                        <TouchableOpacity style={styles.ViewBtn} onPress={() => navigation.navigate('BusinessDetailView', { id: item.businessId })}>
                                            <Image source={require('../assets/ViewImg.png')} style={styles.ViewBtnImg} />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.industry}> {item.industry} </Text>
                                    <Text style={styles.memberDetails}> {item.distance} mi | Member Since - {moment(item.createdDate).format("MM/DD/YYYY")}</Text>

                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.cardView}>
                                            <Card style={[{ width: 150, borderRadius: 20, height: 150, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }, isPromoModalVisible ? { opacity: 0.4 } : '', isAutoPilotModalVisible ? { opacity: 0.4 } : '']}>
                                                <Text style={styles.badge}> {item.badgeName} </Text>
                                                <Image source={require('../assets/vector-ZRj.png')} style={[styles.trophyImg, { tintColor: item.badgeColor }]} />
                                                <Text style={styles.memberPoints}> {item.currentPoints} pt </Text>
                                            </Card>

                                            {item.promotionData.map((promotion, earnReward) => (
                                                <Card key={earnReward} style={[{ width: 150, borderRadius: 20, height: 150, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }, isPromoModalVisible ? { opacity: 0.4 } : '', isAutoPilotModalVisible ? { opacity: 0.4 } : '']}>
                                                    <Text style={styles.achievableName}> {promotion.promotionalMessage} </Text>
                                                    <Text style={styles.achievalbeValue}> {promotion.expiryDays} days </Text>
                                                    <TouchableOpacity onPress={() => openPromoModal(promotion, item)} style={[promotion.isClaimed == false ? styles.frame2vJuClaim : styles.frame2vJuClaimed]}>
                                                        {promotion.isClaimed == false && <Text style={styles.getStartednru}>Claim</Text>}
                                                        {promotion.isClaimed == true && <Text style={styles.getStartednru}>Claimed</Text>}
                                                    </TouchableOpacity>
                                                </Card>
                                            ))}

                                            {item.autopilotData.map((autopilot, earnReward) => (
                                                <Card key={earnReward} style={[{ width: 150, borderRadius: 20, height: 150, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }, isPromoModalVisible ? { opacity: 0.4 } : '', isAutoPilotModalVisible ? { opacity: 0.4 } : '']}>
                                                    <Text style={styles.achievableName}> {autopilot.rewardName} </Text>
                                                    <Text style={styles.achievalbeValue}> {autopilot.expiryDays} days </Text>
                                                    <TouchableOpacity onPress={() => openAPModal(autopilot, item)} style={[autopilot.isClaimed == false ? styles.frame2vJuClaim : styles.frame2vJuClaimed]}>
                                                        {autopilot.isClaimed == false && <Text style={styles.getStartednru}>Claim</Text>}
                                                        {autopilot.isClaimed == true && <Text style={styles.getStartednru}>Claimed</Text>}
                                                    </TouchableOpacity>
                                                </Card>
                                            ))}

                                            {item.rewardData.map((reward, earnReward) => (
                                                <Card key={earnReward} style={[{ width: 150, borderRadius: 20, height: 150, marginRight: 10, marginBottom: 5, backgroundColor: '#f4f5f5' }, isPromoModalVisible ? { opacity: 0.4 } : '', isAutoPilotModalVisible ? { opacity: 0.4 } : '']}>
                                                    <Text style={styles.achievableName}> {reward.rewardName} </Text>
                                                    <Text style={styles.achievalbeValue}> {reward.achivableTargetValue} pts </Text>
                                                    <View>
                                                        <Progress.Bar
                                                            style={styles.progressBar}
                                                            progress={1 - ((reward.pendingToAchiveValue) / reward.achivableTargetValue)}
                                                            width={110}
                                                            color='#2ac95d' />
                                                    </View>
                                                    {(reward.pendingToAchiveValue > 0) && <Text style={styles.pendingpoints}> {reward.pendingToAchiveValue} left </Text>}
                                                    {(reward.pendingToAchiveValue <= 0) && <Text style={styles.pendingpoints}> 0 left </Text>}
                                                </Card>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            ))}
                        </View>

                        <SafeAreaView>
                            <View style={styles.container}>
                                <Spinner
                                    visible={loading}
                                    textContent={''}
                                    textStyle={styles.spinnerStyle} />
                            </View>
                        </SafeAreaView>
                    </ScrollView >
                </SafeAreaView>
            </View>

            <Modal
                animationType={'slide'}
                transparent={true}
                visible={isPromoModalVisible}
                onRequestClose={() => {
                    console.log('Modal has been closed.');
                }}>
                <View style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={styles.modal}>
                        <View style={{ flexDirection: 'row', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            {/* <Text style={styles.welcomeText}>User Profile</Text> */}
                            <Image source={{ uri: logoUrl }} style={styles.logoBusinessInModal} />

                            <TouchableOpacity onPress={closePromoModal} style={styles.cancelImgContainer}>
                                <Image source={require('../assets/cancelImg.png')} style={styles.cancelImg} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalbusinessName}>{businessClaimData.businessName}</Text>
                        <Text style={styles.modalPromoMsg}>{promotionClaimData.promotionalMessage}</Text>
                        <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Offer Start Date </Text>- {moment(promotionClaimData.offerStartDate).format("MM/DD/YYYY")}</Text>
                        <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Offer End Date </Text>- {moment(promotionClaimData.offerEndDate).format("MM/DD/YYYY")}</Text>
                        <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Expires in </Text>-{promotionClaimData.expiryDays} days</Text>
                        {promotionClaimData.isSpinWheel && <Text style={styles.modaltext}>Spinwheel available at store</Text>}

                        {(promotionClaimData.filePath != '' && promotionClaimData.filePath != null) && <Image style={styles.avatarImg} source={{ uri: Globals.Root_URL + promotionClaimData.filePath }} ></Image>}
                        <Text style={styles.modaltext}>Redeemable at -<Text style={{ fontWeight: '700' }}> {promotionClaimData.redeemableAt}</Text></Text>
                        {promotionClaimData.isClaimed == false && <TouchableOpacity onPress={() => closePromoRedeemModal('promo', promotionClaimData.id)} style={styles.frame2vJu1ModalClaim}>
                            <Text style={styles.getStartednru1}>Claim</Text>
                        </TouchableOpacity>}
                        {promotionClaimData.isClaimed == true &&
                            <TouchableOpacity style={styles.frame2vJu1ModalBack}>
                                <Text style={styles.getStartednru1}>Claimed</Text>
                            </TouchableOpacity>
                        }
                        {/* <Button
                                    title="Click To Close Modal"
                                    onPress={closePromoRedeemModal}
                                /> */}
                    </View>
                </View>
            </Modal>

            <Modal
                animationType={'slide'}
                transparent={true}
                visible={isAutoPilotModalVisible}
                onRequestClose={() => {
                    console.log('Modal has been closed.');
                }}>
                <View style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <View style={styles.modal}>
                        <View style={{ flexDirection: 'row', width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={{ uri: logoUrl }} style={styles.logoBusinessInModal} />
                            <TouchableOpacity onPress={closeAPModal} style={styles.cancelImgContainer}>
                                <Image source={require('../assets/cancelImg.png')} style={styles.cancelImg} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalbusinessName}>{businessClaimData.businessName}</Text>
                        <Text style={styles.modalPromoMsg}>{autoPilotClaimData.rewardName}</Text>
                        <Text style={styles.modaltext}><Text style={{ fontWeight: '700' }}>Expires in </Text>- {autoPilotClaimData.expiryDays} days</Text>

                        {(autoPilotClaimData.filePath != '' && autoPilotClaimData.filePath != null) && <Image style={styles.avatarImg} source={{ uri: Globals.Root_URL + autoPilotClaimData.filePath }} ></Image>}
                        <Text style={styles.modaltext}>Redeemable at -<Text style={{ fontWeight: '700' }}> Any Locations</Text></Text>
                        {autoPilotClaimData.isClaimed == false && <TouchableOpacity onPress={() => closeAutoPilotRedeemModal('ap', autoPilotClaimData.historyId)} style={styles.frame2vJu1ModalClaim}>
                            <Text style={styles.getStartednru1}>Claim</Text>
                        </TouchableOpacity>}
                        {autoPilotClaimData.isClaimed == true &&
                            <TouchableOpacity style={styles.frame2vJu1ModalBack}>
                                <Text style={styles.getStartednru1}>Claimed</Text>
                            </TouchableOpacity>
                        }
                    </View>
                </View>
            </Modal>

        </View >
    );
};

const styles = StyleSheet.create({
    cancelImgContainer: {
        alignSelf: 'flex-end',
        position: 'absolute',
        right: 0,
        height: 50,
        justifyContent: 'flex-start'
    },
    cancelImg: {
        width: 25,
        height: 25,
        marginTop: 5,
        marginEnd: 5
        // position: 'absolute',
        // alignSelf: 'flex-end',
        // right: 0,
    },
    scrollContainer: {
        paddingTop: '5%',
        height: '90%',
        width: '97%',
        alignItems: 'center',
        borderRadius: 50
    },
    modalcontainer: {
        flex: 1,
        backgroundColor: '#fff',
        // marginTop: '-20%',
        width: '100%',
        height: '100%',
        backgroundColor: '#000'
    },
    avatarImg: {
        // width: '2%'
        height: 150,
        width: 150,
        marginVertical: 7,
        alignSelf: 'center',
        borderRadius: 15
    },
    suncontainer: {
        width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'
    },
    modcontainer: {

        width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', position: 'absolute'
    },
    modal: {
        alignSelf: 'center',
        backgroundColor: '#fff',
        // padding: 100,
        // height: '75%',
        width: '85%',
        // marginTop: '30%',
        position: 'relative',
        borderRadius: 15,
        padding: 5
    },
    modaltext: {
        color: '#3f2949',
        marginTop: 5,
        paddingHorizontal: 10
    },
    cardView: {
        width: 150,
        height: 150,
        marginRight: 9,
    },
    frame2vJuClaim: {
        backgroundColor: '#7d5513',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 35,
        position: 'absolute',
        top: 105,
        alignSelf: 'center',
        marginTop: 5
    },
    ViewBtn: {
        // backgroundColor: '#7d5513',
        // borderRadius: 8,
        // alignItems: 'center',
        // justifyContent: 'center',
        // width: '60%',
        // height: 10,
        // position: 'absolute',
        // top: 105,
        // alignSelf: 'center',
        // marginTop: 15,
        // padding: 15
        paddingStart: 15,
        bottom: '10%',
    },
    frame2vJuClaimed: {
        backgroundColor: '#6b6868',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 35,
        position: 'absolute',
        top: 105,
        alignSelf: 'center',
        marginTop: 5
    },
    frame2vJu1ModalClaim: {
        backgroundColor: '#7d5513',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 35,
        // position: 'absolute',
        // top: '97%',
        // bottom: 10,
        marginVertical: 15,
        alignSelf: 'center'
    },
    frame2vJu1ModalBack: {
        backgroundColor: '#969696',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '60%',
        height: 35,
        // position: 'absolute',
        // top: '97%',
        // bottom: 10,
        marginVertical: 15,
        alignSelf: 'center'
    },
    getStartednru: {
        lineHeight: 22.5,
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 14,
        color: '#ffffff',
        flex: 10,
        zIndex: 10,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    ViewBtnImg: {
        // lineHeight: 22.5,
        // fontFamily: 'SatoshiVariable, SourceSansPro',
        // flexShrink: 0,
        // fontWeight: 'bold',
        // fontSize: 14,
        // color: '#ffffff',
        // flex: 10,
        // zIndex: 10,
        // textAlign: 'center',
        // textAlignVertical: 'center',
        height: 15,
        width: 15
    },
    getStartednru1: {
        lineHeight: 22.5,
        fontFamily: 'SatoshiVariable, SourceSansPro',
        flexShrink: 0,
        fontWeight: 'bold',
        fontSize: 14,
        color: '#ffffff',
        flex: 10,
        zIndex: 10,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    pendingpoints: {
        color: '#73a5bc',
        fontWeight: '800',
        top: 45,
        left: 40,
        bottom: 12,
        fontSize: 16
    },
    progressBar: {
        top: 35,
        left: 20
    },
    achievalbeValue: {
        color: '#717679',
        fontWeight: '700',
        fontSize: 15,
        top: '25%'
    },
    achievableName: {
        fontWeight: '700',
        color: '#000000',
        fontSize: 15,
        width: 150,
        top: '20%',
        padding: '2%',
        left: 5
    },
    scrollviewContainer: {
        flex: 1,
        height: '100%',
        width: '97%',
        borderRadius: 50
    },
    badge: {
        color: '#000000',
        fontWeight: '700',
        alignSelf: 'center',
        top: '20%',
        fontSize: 17
    },
    memberPoints: {
        color: '#73a5bc',
        fontWeight: '800',
        top: 40,
        left: 57,
        bottom: 20,
        fontSize: 16
    },
    trophyImg: {
        width: 60,
        height: 50,
        alignSelf: 'center',
        top: '30%'
    },
    cardView: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    memberDetails: {
        color: '#203139',
        fontWeight: '700',
        fontSize: 14,
        bottom: '6%',
        right: '1.5%'
    },
    industry: {
        color: '#717679',
        fontWeight: '700',
        fontSize: 15,
        bottom: '10%',
        right: '1.5%'
    },
    totalLikes: {
        alignSelf: 'flex-end',
        bottom: '19%',
        right: '-4%',
        fontWeight: '700',
        fontSize: 14,
        color: '#717679'
    },
    likeHeart: {
        width: 24,
        height: 21,
        alignSelf: 'flex-end',
        right: '21%',
        bottom: '12%'
    },
    businessName: {
        fontWeight: '800',
        fontSize: 18,
        color: '#000000',
        bottom: '12%',
    },
    logoBusiness: {
        height: 50,
        width: 100
    },
    logoBusinessInModal: {
        height: 50,
        width: 100,
        marginTop: 10,
        marginLeft: 10,
        alignSelf: 'center'
    },
    listView: {
        padding: '5%',
        backgroundColor: 'white',
        borderRadius: 15,
        width: '100%',
        marginBottom: '3%'
    },
    wishlistView: {
        // padding: '10%',
        // margin: '2%',
        // backgroundColor: 'white',
        padding: 10,
        height: '100%',
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    notificationImg: {
        width: 49,
        height: 49,
        resizeMode: 'contain',
        flex: 1,
        position: 'absolute',
        top: '1%',
    },
    welcomeText: {
        color: 'black',
        fontSize: 24,
        fontWeight: '600',
        textAlign: 'center',
        width: '80%'
    },
    container: {
        height: '100%',
        width: '100%',
        backgroundColor: '#d9e7ed',
        alignItems: 'center'
    },
    setimg1: {
        width: 50,
        height: 50,
        marginTop: -20,
        position: 'absolute',
        alignSelf: 'flex-end',
        right: -20
    },
    modalbusinessName: {
        fontWeight: '800',
        fontSize: 18,
        color: '#325b6f',
        textAlign: 'center',
        marginTop: 7,
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'black',
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingVertical: 5
    },
    modalPromoMsg: {
        fontWeight: '600',
        fontSize: 15,
        color: '#f77c8c',
        paddingHorizontal: 10,
        marginTop: 20
    }
})

export default Favourite;