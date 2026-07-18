import fetch from 'node-fetch';

async function test() {
    const uid = '78626a75d92e4b138623fc78da391ead';
    const url = `https://api.sketchfab.com/v3/models/${uid}`;
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const item: any = await res.json();
        console.log("UID:", item.uid);
        console.log("Name:", item.name);
        console.log("Viewer URL:", item.viewerUrl);
        console.log("Like Count:", item.likeCount);
        console.log("View Count:", item.viewCount);
        console.log("Tags:", item.tags?.map((t: any) => t.name));
        console.log("Description:", item.description);
    } catch (e) {
        console.error(e);
    }
}

test();
