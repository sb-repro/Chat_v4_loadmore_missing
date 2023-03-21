import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import SendbirdChat, {User} from '@sendbird/chat';
import {
  GroupChannelCollection,
  GroupChannelFilter,
  GroupChannelListOrder,
  GroupChannelModule,
} from '@sendbird/chat/groupChannel';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const sb = SendbirdChat.init({
  appId: '2D7B4CDB-932F-4082-9B09-A1153792DC8D',
  modules: [new GroupChannelModule()],
  localCacheEnabled: true,
  useAsyncStorageStore: AsyncStorage,
});

export default () => {
  const [user, setUser] = useState<User>();
  const [gcc, setGcc] = useState<GroupChannelCollection>();
  const [gccs, setGccs] = useState<GroupChannelCollection[]>([]);
  const update = useForceUpdate();

  useEffect(() => {
    sb.connect('TestUser').then(async currentUser => {
      setUser(currentUser);
      setGcc(createChannelCollection());

      setGccs(() => {
        return Array(50)
          .fill(null)
          .map(() => createChannelCollection());
      });
    });
  }, []);

  return (
    <SafeAreaView>
      <Text>Generated collections:{gccs.length}</Text>
      <Text>
        loadMore not defined collections:
        {gccs.filter(it => !it.loadMore).length}
      </Text>
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: 'black',
          marginVertical: 20,
        }}
      />
      {gcc && (
        <View style={{width: '90%', alignSelf: 'center'}}>
          <Text>{'gcc.hasMore ==>  ' + gcc.hasMore}</Text>
          <Text>{'gcc.loadMore ==>  ' + gcc.loadMore}</Text>

          {/** If loadMore is not defined, this button should not be visible **/}
          {gcc.loadMore && (
            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                await gcc.loadMore();
                update();
              }}>
              <Text style={{color: 'white'}}>
                {'GroupChannelCollection.loadMore()'}
              </Text>
            </TouchableOpacity>
          )}

          <Text>{'gcc.channels.length ==>  ' + gcc.channels.length}</Text>
          <View style={{alignSelf: 'center', width: '100%'}}>
            {gcc.channels.map(channel => {
              return (
                <View
                  key={channel.url}
                  style={{flexDirection: 'row', borderWidth: 1, width: '100%'}}>
                  <Image
                    style={{width: 20, height: 20, backgroundColor: 'gray'}}
                    source={{uri: channel.coverUrl || 'https://invalid-url'}}
                  />
                  <Text>{'name:' + channel.name}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

function createChannelCollection() {
  const filter = new GroupChannelFilter();
  filter.includeEmpty = true;

  return sb.groupChannel.createGroupChannelCollection({
    filter,
    limit: 100,
    order: GroupChannelListOrder.LATEST_LAST_MESSAGE,
  });
}

function useForceUpdate() {
  const [_, setState] = useState(0);
  return () => setState(prev => prev + 1);
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 30,
    backgroundColor: '#2a68ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
});
