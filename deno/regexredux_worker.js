self.onmessage = ({data}) => {
    const str = data.data;

    const len = str
      .replace(/tHa[Nt]/g, '<4>')
      .replace(/aND|caN|Ha[DS]|WaS/g, '<3>')
      .replace(/a[NSt]|BY/g, '<2>')
      .replace(/<[^>]*>/g, '|')
      .replace(/\|[^|][^|]*\|/g, '-')
      .length;

    self.postMessage({len});
    self.close();
}
