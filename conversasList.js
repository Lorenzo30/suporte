import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, ImageBackground, TextInput, Image, TouchableHighlight, Button, FlatList } from 'react-native';
import { connect } from "react-redux";
import SafeAreaView from 'react-native-safe-area-view';
import { getChatList, setActiveChat } from "../actions/chatActions";
import ConversasItem from "../Components/ConversasList/ConversasItem";
import Icon from "react-native-vector-icons/FontAwesome5";
import { SearchBar, ThemeConsumer } from 'react-native-elements';
import BotaoVoltar from "../Components/botaoVoltar";
import firebase from "../forebaseConnection";


export class ConversasList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            foi: false,
            error: null,
            search: "",
            idUser2:"",
            uniqueValue:1,

        }
        this.conversaClick = this.conversaClick.bind(this);
     
    }

    conversaClick(data) {
        let state = this.state;
        state.idUser2 = data.user2;
        this.setState(state);
        this.props.setActiveChat(data.key);
    }
   
 
    //Barra de pesquisa flat list
    renderHeader = () => {
        return (
            <SearchBar
                placeholder="Digite aqui..."
                lightTheme
                round
                onChangeText={(text) => this.searchFilterFunction(text)}
                autoCorrect={true}
                value={search => this.setState({ search: search })}
            />
        )
    };
    //filtro de pesquisa 
    searchFilterFunction = (text) => {
        const newData = this.state.data.filter(item => {
            const itemData = `${item.title}`;
            const textData = text.toUpperCase();
            
            return itemData.indexOf(textData) > -1;
           
        });
    };

    componentDidUpdate() {
        if (this.props.activeChat != "") {
                if(this.state.idUser2 == "" && !!this.props.idUser2){
                    let state  = this.state;
                    state.idUser2 = this.props.idUser2
                    this.setState(state);
                }
                this.props.navigation.navigate("conversaInterna", [{ title: this.props.activeChatTitle }
                    , { tokenUser2: this.props.tokenUser2 }, { idMsg: this.props.activeChat }, { chatImage: this.props.chatImage },{idUser2:this.state.idUser2}]); 
                  
             }
        
           if (!!this.props.navigation.state.params && this.props.navigation.state.params[0] != undefined) {
            // alert("entrei")
            this.props.setActiveChat(this.props.navigation.state.params[0]);
            this.props.navigation.state.params[0] = null;
            }
        }
       
    

    static navigationOptions = ({navigation}) => {
        return {
            headerTitle:"Minhas conversas",
            headerLeft:() => (
                    <BotaoVoltar cor="#000000" marginLeft={10} onPress={() => navigation.navigate("telaInicial")} />   
             ),
             tabBarIcon: ({ focused, tintColor }) => {
                    if (focused) {
                        return <Icon name="rocketchat" color="#ffffff" size={22} />
                    } else {
                        return <Icon name="rocketchat" color="#ffffff" size={22} />
                    }
         
                }
        }
    };
    
    render() {
           
        if(!!this.props.chats){
        }else{
            this.props.getChatList(this.props.id);
        }
            const {chats} = this.props;
            return (
                <SafeAreaView style={styles.body}>
                    <View style={styles.body}>
                        <FlatList 
                            data={chats} 
                            renderItem={({ item }) => <ConversasItem data={item} onPress={this.conversaClick} />}
                            ListHeaderComponent={this.renderHeader} 
                            keyExtractor={item => item.title}
                            extraData={this.props.chats}
                        />
                    </View>
                </SafeAreaView>
       
            );

        }
}


const styles = StyleSheet.create({
    body: {
        flex: 1
    }
})


const mapStateToProps = (state) => ({
    id: state.auth.idUsuario,
    contatos: state.chat.contatos,
    activeChat: state.chat.activeChat,
    chats: state.chat.chats,
    activeChatTitle: state.chat.activeChatTitle,
    tokenUser2: state.chat.tokenUser2,
    chatImage: state.chat.chatImage,
    carregou: state.chat.carregou,
    idUser2:state.chat.iduser2

});

const contatoConnect = connect(mapStateToProps, { getChatList, setActiveChat })(ConversasList);
export default contatoConnect;